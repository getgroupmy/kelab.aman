-- Membership applications and the admins who review them.
--
-- Applicants never talk to the database directly: the public form posts to a
-- Next.js server action, which validates input and writes with the service
-- role key. Admins read and review through their own session, so RLS below
-- only needs to grant access to admins.

create type public.membership_type as enum ('ordinary', 'associate', 'student');
create type public.application_status as enum ('pending', 'approved', 'rejected');

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  full_name text not null check (char_length(full_name) between 2 and 200),
  email text not null check (char_length(email) <= 320),
  phone text not null check (char_length(phone) <= 30),

  id_number text not null check (char_length(id_number) <= 30),
  date_of_birth date not null,
  address text not null check (char_length(address) <= 1000),

  membership_type public.membership_type not null,
  reason text not null check (char_length(reason) <= 2000),
  referral text check (char_length(referral) <= 200),

  -- Object paths inside the private "applications" storage bucket.
  photo_path text not null,
  document_path text not null,

  status public.application_status not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  review_note text check (char_length(review_note) <= 2000)
);

create index membership_applications_status_created_at_idx
  on public.membership_applications (status, created_at desc);

-- One open application per email address.
create unique index membership_applications_one_pending_per_email
  on public.membership_applications (lower(email))
  where status = 'pending';

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.admins enable row level security;
alter table public.membership_applications enable row level security;

create policy "Admins can see the admin list"
  on public.admins for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can read applications"
  on public.membership_applications for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can review applications"
  on public.membership_applications for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Explicit grants rather than relying on the project's default privileges.
-- Anonymous visitors get nothing; the server writes applications with the
-- service role. Admins may only change review fields, so everything the
-- applicant submitted stays as submitted.
revoke all on public.admins, public.membership_applications from anon, authenticated;
grant select on public.admins to authenticated;
grant select on public.membership_applications to authenticated;
grant update (status, reviewed_by, reviewed_at, review_note)
  on public.membership_applications to authenticated;
grant all on public.admins, public.membership_applications to service_role;

-- Private bucket for photos and supporting documents.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'applications',
  'applications',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

create policy "Admins can read application files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'applications' and (select public.is_admin()));
