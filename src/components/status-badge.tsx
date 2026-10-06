import { STATUS_LABELS, type ApplicationStatus } from "@/lib/applications";

const STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-brand-50 text-brand-800 ring-brand-100",
  rejected: "bg-red-50 text-red-700 ring-red-200",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
