"use client";

import { useRef, useState } from "react";
import SubmitButton from "@/components/admin/SubmitButton";
import { DEFAULT_HERO_IMAGE } from "@/lib/heroImage";
import { updateSiteSettings, resetSiteSettings } from "@/app/admin/settings/actions";

const FIELDS = [
  { name: "hero_image_mobile", label: "Mobile (below 640px)", recommended: "1080×800" },
  { name: "hero_image_tablet", label: "Tablet (640px–767px)", recommended: "1536×900" },
  { name: "hero_image_desktop", label: "Desktop (768px and up)", recommended: "1920×1080" },
] as const;

type FieldName = (typeof FIELDS)[number]["name"];

export default function HeroSettingsForm({
  initial,
}: {
  initial: Record<FieldName, string>;
}) {
  const [urls, setUrls] = useState<Record<FieldName, string>>(initial);
  const [previews, setPreviews] = useState<Record<FieldName, string>>(initial);
  const [dims, setDims] = useState<Partial<Record<FieldName, string>>>({});
  const fileInputs = useRef<Partial<Record<FieldName, HTMLInputElement>>>({});

  function loadDimensions(name: FieldName, src: string) {
    const img = new window.Image();
    img.onload = () => {
      setDims((d) => ({ ...d, [name]: `${img.naturalWidth}×${img.naturalHeight}px` }));
    };
    img.onerror = () => {
      setDims((d) => ({ ...d, [name]: undefined }));
    };
    img.src = src;
  }

  function handleUrlChange(name: FieldName, value: string) {
    setUrls((u) => ({ ...u, [name]: value }));
    // Typing a URL supersedes any file already picked for this field - the
    // action prefers the file input, so it must actually be cleared too.
    const input = fileInputs.current[name];
    if (input) input.value = "";
    const src = value || DEFAULT_HERO_IMAGE;
    setPreviews((p) => ({ ...p, [name]: src }));
    loadDimensions(name, src);
  }

  function handleFileChange(name: FieldName, file: File | undefined) {
    if (!file) return;
    setUrls((u) => ({ ...u, [name]: "" }));
    const objectUrl = URL.createObjectURL(file);
    setPreviews((p) => ({ ...p, [name]: objectUrl }));
    loadDimensions(name, objectUrl);
  }

  return (
    <>
      <form action={updateSiteSettings} className="flex flex-col gap-7 mt-8">
        {FIELDS.map(({ name, label, recommended }) => (
          <div key={name} className="field-label">
            {label}
            <span className="ph-photo rounded-2xl w-full h-36 mt-2 block overflow-hidden">
              <img
                src={previews[name] || DEFAULT_HERO_IMAGE}
                alt={`${label} preview`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_HERO_IMAGE;
                }}
              />
            </span>
            <div className="flex items-center justify-between text-xs text-ink-faint mt-1.5">
              <span>{dims[name] ?? " "}</span>
              <span>Recommended: {recommended}</span>
            </div>
            <input
              name={name}
              type="url"
              placeholder="https://…"
              value={urls[name]}
              onChange={(e) => handleUrlChange(name, e.target.value)}
              className="field mt-2"
            />
            <input
              ref={(el) => {
                fileInputs.current[name] = el ?? undefined;
              }}
              name={`${name}_file`}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(name, e.target.files?.[0])}
              className="field mt-2"
            />
          </div>
        ))}
        <SubmitButton>Save changes</SubmitButton>
      </form>

      <form action={resetSiteSettings} className="mt-4">
        <button
          type="submit"
          className="text-sm text-ink-faint cursor-pointer transition-colors hover:text-warn-ink"
        >
          Reset to default
        </button>
      </form>
    </>
  );
}
