"use client";

import PlaceholderPhoto from "@/components/PlaceholderPhoto";

// ponytail: model-viewer's own auto-rotate drives the spin - no rAF loop, no scroll math.
export default function CupViewer({ ready }: { ready: boolean }) {
  return (
    <div className="flex items-center justify-center h-[68vh] sm:h-[min(78vh,640px)]">
      {ready ? (
        <model-viewer
          src="/ceramic_cup_with_cherry.glb"
          alt="Sarautile ceramic mug with cherry"
          camera-orbit="0deg 75deg 105%"
          field-of-view="30deg"
          shadow-intensity="1"
          exposure="1"
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="12deg"
          disable-zoom
          interaction-prompt="none"
          loading="eager"
          style={
            {
              width: "min(96%, 600px)",
              height: "min(96%, 600px)",
              "--poster-color": "transparent",
            } as React.CSSProperties
          }
        />
      ) : (
        <PlaceholderPhoto
          label="sarautile hero cup"
          rounded="rounded-[32px]"
          className="w-[min(96%,600px)] h-[min(96%,600px)]"
          sizes="480px"
          priority
        />
      )}
    </div>
  );
}
