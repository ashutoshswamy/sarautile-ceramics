import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  src?: string;
  alt?: string;
  poster?: string;
  ar?: boolean;
  "camera-controls"?: boolean;
  "disable-zoom"?: boolean;
  "interaction-prompt"?: string;
  "camera-orbit"?: string;
  "auto-rotate"?: boolean;
  "auto-rotate-delay"?: string | number;
  "rotation-per-second"?: string;
  "field-of-view"?: string;
  "shadow-intensity"?: string;
  exposure?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "interaction" | "manual";
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}

export {};
