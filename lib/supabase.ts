import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/** Service-role client — server only. Returns null when not configured (local dev). RLS stays on; this key bypasses it. */
export function supabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client =
    url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  if (!client)
    console.warn("[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — writes are skipped");
  return client;
}
