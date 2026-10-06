import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { MEMBERSHIP_TYPES, type Application } from "@/lib/applications";
import { requireAdmin } from "@/lib/auth";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = { title: "Application" };

const SIGNED_URL_SECONDS = 10 * 60;

export default async function ApplicationPage({
  params,
}: PageProps<"/admin/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;

  const { data } = await supabase
    .from("membership_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const app = data as Application;

  const { data: signed } = await supabase.storage
    .from("applications")
    .createSignedUrls([app.photo_path, app.document_path], SIGNED_URL_SECONDS);
  const [photoUrl, documentUrl] = [
    signed?.[0]?.signedUrl,
    signed?.[1]?.signedUrl,
  ];
  const documentIsPdf = app.document_path.endsWith(".pdf");

  return (
    <div>
      <Link href="/admin" className="text-sm text-stone-600 hover:text-stone-900">
        ← All applications
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{app.full_name}</h1>
        <StatusBadge status={app.status} />
      </div>
      <p className="mt-1 text-sm text-stone-500">
        Submitted {formatDateTime(app.created_at)}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Card title="Applicant">
            <Row label="Email">
              <a href={`mailto:${app.email}`} className="text-brand-700 underline">
                {app.email}
              </a>
            </Row>
            <Row label="Phone">{app.phone}</Row>
            <Row label="IC / passport">{app.id_number}</Row>
            <Row label="Date of birth">{formatDate(app.date_of_birth)}</Row>
            <Row label="Address">
              <span className="whitespace-pre-line">{app.address}</span>
            </Row>
          </Card>

          <Card title="Membership">
            <Row label="Type">{MEMBERSHIP_TYPES[app.membership_type]}</Row>
            <Row label="Referred by">{app.referral ?? "—"}</Row>
            <Row label="Reason">
              <span className="whitespace-pre-line">{app.reason}</span>
            </Row>
          </Card>

          {app.status === "pending" ? (
            <Card title="Decision">
              <ReviewForm id={app.id} />
            </Card>
          ) : (
            <Card title="Decision">
              <Row label="Outcome">
                <StatusBadge status={app.status} />
              </Row>
              <Row label="Reviewed">
                {app.reviewed_at ? formatDateTime(app.reviewed_at) : "—"}
              </Row>
              <Row label="Note">
                <span className="whitespace-pre-line">{app.review_note ?? "—"}</span>
              </Row>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card title="Photo">
            {photoUrl ? (
              <a href={photoUrl} target="_blank" rel="noreferrer">
                {/* Signed URLs expire, so next/image caching doesn't help here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={`Photo of ${app.full_name}`}
                  className="w-full rounded-lg border border-stone-200 object-cover"
                />
              </a>
            ) : (
              <p className="text-sm text-stone-500">Photo unavailable.</p>
            )}
          </Card>
          <Card title="Supporting document">
            {documentUrl ? (
              <a
                href={documentUrl}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                {documentIsPdf ? (
                  <span className="text-brand-700 underline">Open PDF</span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={documentUrl}
                    alt="Supporting document"
                    className="w-full rounded-lg border border-stone-200"
                  />
                )}
              </a>
            ) : (
              <p className="text-sm text-stone-500">Document unavailable.</p>
            )}
            <p className="mt-2 text-xs text-stone-500">
              Links expire after 10 minutes. Reload the page for fresh ones.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-900">{children}</dd>
    </div>
  );
}

const TZ = "Asia/Kuala_Lumpur";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: value.length === 10 ? "UTC" : TZ,
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TZ,
  });
}
