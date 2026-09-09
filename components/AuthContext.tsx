"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { load, save } from "@/lib/storage";

// ponytail: client-only demo auth. Passwords are SHA-256'd with the email as
// salt and kept in localStorage - enough to not store plaintext, NOT real
// security. Swap AuthProvider for a real backend (Supabase etc.) when there is one.

const USERS_KEY = "sarautile.users";
const SESSION_KEY = "sarautile.session";

export type User = { name: string; email: string };
type StoredUser = User & { hash: string };
type Users = Record<string, StoredUser>;

type Result = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  signUp: (input: { name: string; email: string; password: string }) => Promise<Result>;
  signIn: (input: { email: string; password: string }) => Promise<Result>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const norm = (email: string) => email.trim().toLowerCase();

async function hashPassword(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${norm(email)}::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const email = load<string | null>(SESSION_KEY, null);
    if (email) {
      const users = load<Users>(USERS_KEY, {});
      const hit = users[email];
      if (hit) setUser({ name: hit.name, email: hit.email });
    }
    setReady(true);
  }, []);

  const signUp = useCallback<AuthContextValue["signUp"]>(async ({ name, email, password }) => {
    const key = norm(email);
    if (!name.trim()) return { ok: false, error: "Name is required." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(key))
      return { ok: false, error: "Enter a valid email." };
    if (password.length < 6)
      return { ok: false, error: "Password must be at least 6 characters." };

    const users = load<Users>(USERS_KEY, {});
    if (users[key]) return { ok: false, error: "An account with that email already exists." };

    const record: StoredUser = {
      name: name.trim(),
      email: key,
      hash: await hashPassword(key, password),
    };
    save(USERS_KEY, { ...users, [key]: record });
    save(SESSION_KEY, key);
    setUser({ name: record.name, email: key });
    return { ok: true };
  }, []);

  const signIn = useCallback<AuthContextValue["signIn"]>(async ({ email, password }) => {
    const key = norm(email);
    const users = load<Users>(USERS_KEY, {});
    const hit = users[key];
    if (!hit) return { ok: false, error: "No account with that email." };
    if (hit.hash !== (await hashPassword(key, password)))
      return { ok: false, error: "Wrong password." };
    save(SESSION_KEY, key);
    setUser({ name: hit.name, email: key });
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    save(SESSION_KEY, null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
