"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (error) {
    return { error: "Incorrect email or password." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type ReviewState = { error?: string };

const reviewSchema = z.object({
  id: z.uuid(),
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(2000),
});

export async function reviewApplication(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const { supabase, userId } = await requireAdmin();

  const parsed = reviewSchema.safeParse({
    id: formData.get("id"),
    decision: formData.get("decision"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { error: "Invalid review." };
  }
  const { id, decision, note } = parsed.data;

  if (decision === "rejected" && !note) {
    return { error: "Add a note explaining why the application was rejected." };
  }

  // Only pending applications can be decided, so two admins reviewing at the
  // same time can't overwrite each other.
  const { data, error } = await supabase
    .from("membership_applications")
    .update({
      status: decision,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      review_note: note || null,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");

  if (error) {
    console.error("Review failed", error);
    return { error: "Could not save the decision. Please try again." };
  }
  if (!data?.length) {
    return { error: "This application has already been reviewed." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  return {};
}
