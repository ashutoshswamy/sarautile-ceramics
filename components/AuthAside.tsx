"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";

const COPY = {
  in: {
    kicker: "Welcome back",
    asideTitle: "Ceramics made slowly, saved for later.",
    asideBody:
      "Pick up where you left off - your wishlist, your cart, and your place in line for the next firing.",
  },
  up: {
    kicker: "New here",
    asideTitle: "Start your shelf.",
    asideBody:
      "One account keeps every piece you love waiting for you - and puts you first in line when the kiln opens.",
  },
};

export default function AuthAside() {
  const pathname = usePathname();
  const signup = pathname.startsWith("/signup");
  const c = signup ? COPY.up : COPY.in;
  const modeKey = signup ? "up" : "in";
  const fadeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!fadeRef.current) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          fadeRef.current,
          { opacity: 0, y: 4 },
          { opacity: 1, y: 0, duration: 0.28, ease: "power1.out" }
        );
      });
      return () => mm.revert();
    },
    { dependencies: [modeKey] }
  );

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

      <div className="relative z-10 max-w-[24rem]">
        <Link href="/" className="inline-block shrink-0">
          <Image src="/logo-nobg.png" alt="" width={192} height={64} className="h-14 w-auto xl:h-16" />
        </Link>

        <div key={modeKey} ref={fadeRef} className="mt-10">
          <span className="kicker">{c.kicker}</span>
          <p className="display-1 mt-4 text-[clamp(1.9rem,2.6vw,2.7rem)]">
            {c.asideTitle}
          </p>
          <p className="lede text-[0.95rem] mt-5">{c.asideBody}</p>
        </div>
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
