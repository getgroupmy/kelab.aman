import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns a session client and the admin's user id, or redirects.
 * Call this at the top of every admin page and server action.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) {
    redirect("/admin/login?error=not-admin");
  }

  return { supabase, userId, email: data.claims.email as string | undefined };
}
