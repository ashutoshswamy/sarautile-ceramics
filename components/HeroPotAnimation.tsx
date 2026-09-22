"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";

export default function HeroPotAnimation({
  start = true,
  onSettled,
}: {
  start?: boolean;
  onSettled?: () => void;
}) {
  const potRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    if (potRef.current) gsap.set(potRef.current, { autoAlpha: 0, scale: 0.9 });
  }, []);

  useGSAP(
    () => {
      if (!start || !potRef.current) return;
      gsap.to(potRef.current, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        delay: 0.2,
        ease: "back.out(2)",
        onComplete: onSettled,
      });
    },
    { dependencies: [start, onSettled] }
  );

  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[460px] aspect-square mx-auto">
      <Image
        ref={potRef}
        src="/hero/hero-image.png"
        alt="Handcrafted terracotta pot"
        fill
        priority
        sizes="(min-width: 768px) 460px, 90vw"
        className="object-contain"
        draggable={false}
      />
    </div>
  );
}
