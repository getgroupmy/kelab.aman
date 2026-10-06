import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Bypasses RLS. Only use it for writes the server has already validated,
// such as storing a public membership application.
export function createServiceClient() {
  return createClient(env.supabaseUrl, env.supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
