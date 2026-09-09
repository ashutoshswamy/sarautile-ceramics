"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import CupViewer from "@/components/CupViewer";
import TypedHeadline from "@/components/TypedHeadline";

const HEADLINE = "Mugs made slowly, on a wheel, by two people.";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(
    () =>
      typeof customElements !== "undefined" &&
      !!customElements.get("model-viewer")
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const compute = () => {
      const el = sectionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const p =
          scrollable > 0
            ? Math.min(1, Math.max(0, -rect.top / scrollable))
            : 0;
        setProgress(p);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(compute);
      }
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <Script
        src="/vendor/model-viewer.min.js"
        type="module"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => console.error("Failed to load model-viewer script")}
      />
      <section
        id="hero"
        ref={sectionRef}
        className="container-x grid md:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-16 items-start pt-20 lg:pt-28 pb-6"
      >
      <div
        className="max-md:order-2 md:sticky md:top-20 md:self-start transition-opacity [opacity:var(--hero-fade)]"
        style={
          { "--hero-fade": Math.min(1, progress / 0.9) } as React.CSSProperties
        }
      >
        <TypedHeadline
          text={HEADLINE}
          progress={progress}
          end={0.92}
          className="display-1 max-w-[18ch] sm:max-w-[12ch] min-h-[4.6em] sm:min-h-[5.2em]"
        />
        <p className="lede max-w-[38ch] mt-5">
          Every one comes out a little different — that&apos;s not a
          defect, it&apos;s the whole point. Thrown in stoneware, glazed in
          five colours we mix ourselves, fired twice.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/mugs" className="btn btn-primary">
            Shop this firing
          </Link>
          <Link href="/story" className="btn btn-ghost">
            Meet the makers
          </Link>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-10 text-xs text-ink-faint">
          <span>Thrown in India</span>
          <span aria-hidden>·</span>
          <span>Dishwasher fine, honestly</span>
          <span aria-hidden>·</span>
          <span>Ships in 3 days</span>
        </div>
      </div>
        <div className="max-md:order-1">
          <CupViewer progress={progress} ready={ready} />
        </div>
      </section>
      <div className="scroll-cue" data-hidden={progress > 0.01} aria-hidden="true">
        <span>scroll</span>
        <span className="scroll-cue__line" />
      </div>
    </>
  );
}
