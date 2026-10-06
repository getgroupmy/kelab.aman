"use server";

import {
  applicationSchema,
  DOCUMENT_TYPES,
  extensionFor,
  PHOTO_TYPES,
  validateFile,
} from "@/lib/applications";
import { createServiceClient } from "@/lib/supabase/service";

export type ApplyState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  values?: Record<string, string>;
};

const TEXT_FIELDS = [
  "full_name",
  "email",
  "phone",
  "id_number",
  "date_of_birth",
  "address",
  "membership_type",
  "reason",
  "referral",
] as const;

export async function submitApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  // Echo text back so a failed submission doesn't wipe the form.
  const values = Object.fromEntries(
    TEXT_FIELDS.map((key) => [key, String(formData.get(key) ?? "")]),
  );

  const parsed = applicationSchema.safeParse(values);
  const photo = validateFile(formData.get("photo"), PHOTO_TYPES, "photo");
  const document = validateFile(
    formData.get("document"),
    DOCUMENT_TYPES,
    "supporting document",
  );

  const fieldErrors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
  }
  if ("error" in photo) fieldErrors.photo = photo.error;
  if ("error" in document) fieldErrors.document = document.error;

  if (!parsed.success || "error" in photo || "error" in document) {
    return {
      status: "error",
      message:
        "Please fix the highlighted fields. For security, your browser clears file uploads, so choose your photo and document again.",
      fieldErrors,
      values,
    };
  }

  const supabase = createServiceClient();
  const id = crypto.randomUUID();
  const photoPath = `${id}/photo.${extensionFor(photo.file.type)}`;
  const documentPath = `${id}/document.${extensionFor(document.file.type)}`;

  const uploads = await Promise.all([
    supabase.storage
      .from("applications")
      .upload(photoPath, photo.file, { contentType: photo.file.type }),
    supabase.storage
      .from("applications")
      .upload(documentPath, document.file, { contentType: document.file.type }),
  ]);

  const cleanUp = () =>
    supabase.storage.from("applications").remove([photoPath, documentPath]);

  if (uploads.some((result) => result.error)) {
    await cleanUp();
    console.error("Upload failed", uploads.map((result) => result.error));
    return {
      status: "error",
      message: "We couldn't upload your files. Please try again.",
      values,
    };
  }

  const { error } = await supabase.from("membership_applications").insert({
    id,
    ...parsed.data,
    photo_path: photoPath,
    document_path: documentPath,
  });

  if (error) {
    await cleanUp();
    if (error.code === "23505") {
      return {
        status: "error",
        message:
          "There is already a pending application for this email address. We'll be in touch once it has been reviewed.",
        values,
      };
    }
    console.error("Insert failed", error);
    return {
      status: "error",
      message: "Something went wrong saving your application. Please try again.",
      values,
    };
  }

  return { status: "success" };
}
