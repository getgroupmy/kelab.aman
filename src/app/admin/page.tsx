import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import {
  MEMBERSHIP_TYPES,
  STATUS_LABELS,
  type Application,
  type ApplicationStatus,
} from "@/lib/applications";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Applications" };

const STATUSES = Object.keys(STATUS_LABELS) as ApplicationStatus[];

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const { supabase, email } = await requireAdmin();
  const { status: statusParam } = await searchParams;
  const status = STATUSES.includes(statusParam as ApplicationStatus)
    ? (statusParam as ApplicationStatus)
    : "pending";

  const [{ data, error }, ...counts] = await Promise.all([
    supabase
      .from("membership_applications")
      .select("id, created_at, full_name, email, membership_type, status")
      .eq("status", status)
      .order("created_at", { ascending: status === "pending" })
      .limit(200),
    ...STATUSES.map((s) =>
      supabase
        .from("membership_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", s),
    ),
  ]);

  const applications = (data ?? []) as Pick<
    Application,
    "id" | "created_at" | "full_name" | "email" | "membership_type" | "status"
  >[];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Membership applications
          </h1>
          <p className="mt-1 text-sm text-stone-600">Signed in as {email}</p>
        </div>
        <form action={signOut}>
          <button className="text-sm text-stone-600 underline hover:text-stone-900">
            Sign out
          </button>
        </form>
      </div>

      <nav className="mt-6 flex gap-2 border-b border-stone-200">
        {STATUSES.map((s, i) => (
          <Link
            key={s}
            href={`/admin?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm text-stone-600 hover:text-stone-900 aria-[current=page]:border-brand-600 aria-[current=page]:font-medium aria-[current=page]:text-stone-900"
          >
            {STATUS_LABELS[s]}
            <span className="ml-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
              {counts[i].count ?? 0}
            </span>
          </Link>
        ))}
      </nav>

      {error ? (
        <p role="alert" className="mt-6 text-sm text-red-600">
          Could not load applications.
        </p>
      ) : applications.length === 0 ? (
        <p className="mt-10 text-center text-stone-500">
          No {STATUS_LABELS[status].toLowerCase()} applications.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
          {applications.map((app) => (
            <li key={app.id}>
              <Link
                href={`/admin/${app.id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-stone-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{app.full_name}</p>
                  <p className="truncate text-sm text-stone-500">{app.email}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-500">
                  <span>{MEMBERSHIP_TYPES[app.membership_type]}</span>
                  <time dateTime={app.created_at}>
                    {formatDate(app.created_at)}
                  </time>
                  <StatusBadge status={app.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kuala_Lumpur",
  });
}
