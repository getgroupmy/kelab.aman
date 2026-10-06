import { z } from "zod";

export const MEMBERSHIP_TYPES = {
  ordinary: "Ordinary",
  associate: "Associate",
  student: "Student",
} as const;

export type MembershipType = keyof typeof MEMBERSHIP_TYPES;
export type ApplicationStatus = "pending" | "approved" | "rejected";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

// Vercel caps request bodies at 4.5 MB, so two 2 MB files plus form fields
// is the most a single submission can carry.
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const DOCUMENT_TYPES = [...PHOTO_TYPES, "application/pdf"];

export type Application = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  date_of_birth: string;
  address: string;
  membership_type: MembershipType;
  reason: string;
  referral: string | null;
  photo_path: string;
  document_path: string;
  status: ApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
};

const trimmed = (max: number) => z.string().trim().max(max);

export const applicationSchema = z.object({
  full_name: trimmed(200).min(2, "Enter your full name."),
  email: z.string().trim().toLowerCase().max(320).pipe(z.email("Enter a valid email address.")),
  phone: trimmed(30).regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number."),
  id_number: trimmed(30).min(5, "Enter your IC or passport number."),
  date_of_birth: z.iso.date("Enter your date of birth.").refine((value) => {
    const dob = new Date(value);
    const now = new Date();
    return dob < now && dob.getFullYear() > now.getFullYear() - 120;
  }, "Enter a valid date of birth."),
  address: trimmed(1000).min(5, "Enter your address."),
  membership_type: z.enum(Object.keys(MEMBERSHIP_TYPES) as [MembershipType, ...MembershipType[]], {
    error: "Choose a membership type.",
  }),
  reason: trimmed(2000).min(10, "Tell us a little more (at least 10 characters)."),
  referral: trimmed(200).optional().transform((value) => value || null),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export function validateFile(
  file: FormDataEntryValue | null,
  allowedTypes: string[],
  label: string,
): { file: File } | { error: string } {
  if (!(file instanceof File) || file.size === 0) {
    return { error: `Upload your ${label}.` };
  }
  if (!allowedTypes.includes(file.type)) {
    return { error: `Your ${label} must be one of: ${allowedTypes.map(describeType).join(", ")}.` };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: `Your ${label} must be 2 MB or smaller.` };
  }
  return { file };
}

function describeType(mime: string) {
  return mime === "application/pdf" ? "PDF" : mime.replace("image/", "").toUpperCase();
}

export function extensionFor(mime: string) {
  return { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" }[mime] ?? "bin";
}
