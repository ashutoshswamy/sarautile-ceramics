"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

// Attaches the signed-in Clerk user's token to every request so Supabase RLS
// (see supabase/schema.sql) can see auth.jwt()->>'sub' and scope rows to
// them. Requires Clerk enabled as a Third-Party Auth provider in Supabase.
//
// Keyed on sessionId, not Clerk's `session` object: that object is replaced
// on every token refresh/focus, which rebuilt the client and re-ran every
// [supabase]-dependent load effect - its SELECT could land before an
// in-flight add's upsert and wipe the optimistic cart.
export function useAuthedSupabase() {
  const { getToken, sessionId } = useAuth();
  return useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          accessToken: async () => {
            const token = await getToken();
            // ponytail: Clerk caches session tokens for ~60s. If the cached
            // token's `iat` is still this close to "now", Supabase can see
            // it as ahead of its own clock and reject it with PGRST303
            // ("JWT issued at future") - mint fresh instead of risking that.
            if (token && iatTooCloseToNow(token)) {
              return (await getToken({ skipCache: true })) ?? null;
            }
            return token ?? null;
          },
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getToken always reads the current session
    [sessionId]
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
