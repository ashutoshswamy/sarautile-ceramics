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
        {
          accessToken: async () => {
            const token = await session?.getToken();
            // ponytail: Clerk caches session tokens for ~60s. If the cached
            // token's `iat` is still this close to "now", Supabase can see
            // it as ahead of its own clock and reject it with PGRST303
            // ("JWT issued at future") - mint fresh instead of risking that.
            if (token && iatTooCloseToNow(token)) {
              return (await session?.getToken({ skipCache: true })) ?? null;
            }
            return token ?? null;
          },
        }
      ),
    [session]
  );
}

function iatTooCloseToNow(jwt: string): boolean {
  try {
    const { iat } = JSON.parse(atob(jwt.split(".")[1]));
    return typeof iat === "number" && iat * 1000 > Date.now() - 2000;
  } catch {
    return false;
  }
}
