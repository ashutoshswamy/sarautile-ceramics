"use client";

import { useMemo } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

// Attaches the signed-in Clerk user's token to every request so Supabase RLS
// (see supabase/schema.sql) can see auth.jwt()->>'sub' and scope rows to
// them. Requires Clerk enabled as a Third-Party Auth provider in Supabase.
export function useAuthedSupabase() {
  const { session } = useSession();
  return useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { accessToken: async () => (await session?.getToken()) ?? null }
      ),
    [session]
  );
}
