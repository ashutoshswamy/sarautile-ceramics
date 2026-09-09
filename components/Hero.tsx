"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { MapPin, Droplets, Truck } from "lucide-react";
import CupViewer from "@/components/CupViewer";

const HEADLINE = "Mugs made slowly, on a wheel, by two people.";

export default function Hero() {
  const [ready, setReady] = useState(
    () =>
      typeof customElements !== "undefined" &&
      !!customElements.get("model-viewer")
  );

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
        className="container-x grid md:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-16 items-center pt-8 lg:pt-14 pb-6"
      >
        <div className="hero-copy">
          <h1 className="display-1 max-w-[18ch] sm:max-w-[12ch]">{HEADLINE}</h1>
          <p className="lede max-w-[38ch] mt-5">
            Every one comes out a little different - that&apos;s not a
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
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} strokeWidth={1.7} aria-hidden />
              Thrown in India
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Droplets size={13} strokeWidth={1.7} aria-hidden />
              Dishwasher fine, honestly
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck size={13} strokeWidth={1.7} aria-hidden />
              Ships in 3 days
            </span>
          </div>
        </div>
        <div>
          <CupViewer ready={ready} />
        </div>
      </section>
    </>
  );
}
