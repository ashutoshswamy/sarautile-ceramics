"use client";

import { usePathname } from "next/navigation";

const COPY = {
  in: {
    kicker: "Welcome back",
    asideTitle: "Mugs made slowly, saved for later.",
    asideBody:
      "Pick up where you left off - your wishlist, your cart, and your place in line for the next firing.",
  },
  up: {
    kicker: "New here",
    asideTitle: "Start your shelf.",
    asideBody:
      "One account keeps every mug you love waiting for you - and puts you first in line when the kiln opens.",
  },
};

export default function AuthAside() {
  const pathname = usePathname();
  const signup = pathname.startsWith("/signup");
  const c = signup ? COPY.up : COPY.in;
  const modeKey = signup ? "up" : "in";

  return (
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-rule bg-canvas p-12 xl:p-16">
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
  );
}
