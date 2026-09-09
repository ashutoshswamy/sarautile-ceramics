"use client";

import { useEffect, useRef } from "react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";

type ModelViewerElement = HTMLElement & { cameraOrbit: string };

// Cross-faded on scroll: the cup keeps spinning while it morphs between models.
const MODELS = [
  "/ceramic_cup_with_cherry.glb",
  "/orange_mug.glb",
  "/cat_mug.glb",
];

export default function CupViewer({
  progress,
  ready,
}: {
  progress: number;
  ready: boolean;
}) {
  const viewerRefs = useRef<(ModelViewerElement | null)[]>([]);
  const shiftRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const orbit = `${progress * 540}deg 75deg 105%`;
    for (const v of viewerRefs.current) {
      if (v) v.cameraOrbit = orbit;
    }

    // Slide from viewport-center (progress 0) back to this column (progress 1).
    // Measure with the transform cleared so the base center is stable.
    const shift = shiftRef.current;
    if (shift) {
      shift.style.transform = "translateX(0px)";
      const rect = shift.getBoundingClientRect();
      const centerDelta =
        window.innerWidth / 2 - (rect.left + rect.width / 2);
      // ease-out so the cup decelerates into its resting spot
      const ease = 1 - Math.pow(1 - progress, 3);
      shift.style.transform = `translateX(${centerDelta * (1 - ease)}px)`;
    }
  }, [progress]);

  // Model i peaks at i/(n-1); fades linearly over one neighbour gap, so exactly
  // one hand-off happens at a time and the opacities always sum to ~1.
  const gap = 1 / (MODELS.length - 1);
  const opacityFor = (i: number) =>
    Math.max(0, 1 - Math.abs(progress - i * gap) / gap);

  return (
    <div className="relative h-[140vh] sm:h-[220vh]">
      <div className="sticky top-20 h-[62vh] sm:h-[min(70vh,560px)] flex items-center justify-center">
        <div
          ref={shiftRef}
          className="flex items-center justify-center w-full h-full will-change-transform"
        >
          {ready ? (
            <div className="relative w-[min(80%,480px)] h-[min(80%,480px)]">
              {MODELS.map((src, i) => (
                <model-viewer
                  key={src}
                  ref={(el: HTMLElement | null) => {
                    viewerRefs.current[i] = el as ModelViewerElement | null;
                  }}
                  src={src}
                  alt="Sarautile ceramic mug"
                  camera-orbit="0deg 75deg 105%"
                  field-of-view="30deg"
                  shadow-intensity="1"
                  exposure="1"
                  disable-zoom
                  interaction-prompt="none"
                  loading="eager"
                  style={
                    {
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      opacity: opacityFor(i),
                      transition: "opacity 0.12s linear",
                      pointerEvents: "none",
                      "--poster-color": "transparent",
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ) : (
            <PlaceholderPhoto
              label="sarautile hero cup"
              rounded="rounded-[32px]"
              className="w-[min(80%,480px)] h-[min(80%,480px)]"
              sizes="480px"
              priority
            />
          )}
        </div>
      </div>
    </div>
  );
}
