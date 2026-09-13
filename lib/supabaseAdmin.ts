import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client - bypasses RLS entirely. Only ever import this from
// admin server actions/pages that have already called requireAdmin(). Never
// expose SUPABASE_SERVICE_ROLE_KEY to the client (no NEXT_PUBLIC_ prefix).
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
