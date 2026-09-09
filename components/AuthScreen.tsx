"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, TriangleAlert } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

const COPY = {
  in: {
    kicker: "Welcome back",
    title: "Sign in",
    sub: "Your wishlist and cart are where you left them.",
    cta: "Sign in",
    fine: "Everything's kept in this browser - sign in on the one you signed up with.",
    asideTitle: "Mugs made slowly, saved for later.",
    asideBody:
      "Pick up where you left off - your wishlist, your cart, and your place in line for the next firing.",
  },
  up: {
    kicker: "New here",
    title: "Make an account",
    sub: "Keep a wishlist and a cart that follow you between visits.",
    cta: "Create account",
    fine: "Making an account keeps your wishlist and cart saved in this browser.",
    asideTitle: "Start your shelf.",
    asideBody:
      "One account keeps every mug you love waiting for you - and puts you first in line when the kiln opens.",
  },
};

export default function AuthScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signIn, signUp, signOut } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const signup = pathname === "/signup";
  const c = signup ? COPY.up : COPY.in;
  const modeKey = signup ? "up" : "in";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = signup
      ? await signUp({ name, email, password })
      : await signIn({ email, password });
    setBusy(false);
    if (res.ok) router.push("/wishlist");
    else setError(res.error);
  }

  return (
    <div className="auth-split grid lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-rule bg-canvas p-12 pt-28 xl:p-16 xl:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -left-24 w-[26rem] h-[26rem] rounded-full bg-terracotta/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-sage-ink-soft/10 blur-3xl"
        />

        <div key={modeKey} className="auth-fade relative z-10 max-w-[24rem]">
          <span className="kicker">{c.kicker}</span>
          <p className="display-1 mt-4 text-[clamp(1.9rem,2.6vw,2.7rem)]">
            {c.asideTitle}
          </p>
          <p className="lede text-[0.95rem] mt-5">{c.asideBody}</p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 text-xs text-ink-faint">
          <span>Thrown in India</span>
          <span aria-hidden>·</span>
          <span>Two people, one kiln</span>
          <span aria-hidden>·</span>
          <span>Since 2019</span>
        </div>
      </aside>

      <div className="flex items-center justify-center px-6 pt-28 pb-16 sm:px-10">
        <div className="w-full max-w-[380px] my-auto">
          {user ? (
            <div>
              <span className="kicker inline-flex items-center gap-1.5">
                <Check size={14} strokeWidth={2.4} aria-hidden />
                Signed in
              </span>
              <h1 className="display-2 mt-3">{user.name}</h1>
              <p className="text-sm text-ink-faint mt-1">{user.email}</p>
              <div className="flex flex-col gap-3 mt-8">
                <Link href="/wishlist" className="btn btn-primary btn-block">
                  Go to wishlist
                  <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
                </Link>
                <button onClick={signOut} className="btn btn-ghost btn-block">
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-tabs" data-mode={modeKey}>
                <span aria-hidden className="auth-tabs__pill" />
                <Link
                  href="/signin"
                  data-active={!signup}
                  aria-current={!signup ? "page" : undefined}
                  className="auth-tabs__tab"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  data-active={signup}
                  aria-current={signup ? "page" : undefined}
                  className="auth-tabs__tab"
                >
                  Sign up
                </Link>
              </div>

              <h1 className="display-2 mt-8">
                <span key={modeKey} className="auth-fade inline-block">
                  {c.title}
                </span>
              </h1>
              <p className="text-sm text-ink-soft mt-2">
                <span key={modeKey} className="auth-fade inline-block">
                  {c.sub}
                </span>
              </p>

              <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-7">
                <div className="auth-collapse" data-open={signup}>
                  <div className="min-h-0">
                    <label className="field-label">
                      Name
                      <input
                        className="field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required={signup}
                        tabIndex={signup ? 0 : -1}
                      />
                    </label>
                  </div>
                </div>

                <label className="field-label">
                  Email
                  <input
                    type="email"
                    className="field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="field-label">
                  Password
                  <span className="relative block">
                    <input
                      type={show ? "text" : "password"}
                      className="field"
                      style={{ paddingRight: "2.75rem" }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={signup ? "new-password" : "current-password"}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink cursor-pointer"
                    >
                      {show ? (
                        <EyeOff size={16} strokeWidth={1.7} />
                      ) : (
                        <Eye size={16} strokeWidth={1.7} />
                      )}
                    </button>
                  </span>
                </label>

                {error && (
                  <p className="flex items-start gap-2 rounded-xl bg-warn-bg px-3.5 py-2.5 text-sm text-warn-ink">
                    <TriangleAlert
                      size={15}
                      strokeWidth={1.9}
                      className="mt-0.5 flex-none"
                      aria-hidden
                    />
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-primary btn-block h-12 mt-1 disabled:opacity-60"
                >
                  <span key={modeKey + String(busy)} className="auth-fade inline-flex items-center gap-2">
                    {busy ? "One sec…" : c.cta}
                    {!busy && <ArrowRight size={16} strokeWidth={1.8} aria-hidden />}
                  </span>
                </button>
              </form>

              <p className="mt-6 text-xs leading-relaxed text-ink-faint">
                <span key={modeKey} className="auth-fade inline-block">
                  {c.fine}
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
