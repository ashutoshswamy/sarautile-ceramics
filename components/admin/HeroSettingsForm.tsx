"use client";

import { useRef, useState } from "react";
import SubmitButton from "@/components/admin/SubmitButton";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { updateSiteSettings, resetSiteSettings } from "@/app/admin/settings/actions";

// previewWidth/previewHeight are the actual on-site crop window for each
// breakpoint (a representative device width x the hero's fixed h-[…] class
// in components/Hero.tsx) - NOT the recommended upload resolution. The
// preview's aspect ratio has to match that crop window, or the framing here
// lies about what the site will actually show.
const FIELDS = [
  {
    name: "hero_image_mobile",
    label: "Mobile (below 640px)",
    recommended: "1080×800",
    previewWidth: 390,
    previewHeight: 560,
  },
  {
    name: "hero_image_tablet",
    label: "Tablet (640px–767px)",
    recommended: "1536×900",
    previewWidth: 700,
    previewHeight: 640,
  },
  {
    name: "hero_image_desktop",
    label: "Desktop (768px and up)",
    recommended: "1920×1080",
    previewWidth: 1920,
    previewHeight: 700,
  },
] as const;

type FieldName = (typeof FIELDS)[number]["name"];
type Position = { x: number; y: number };

const DEFAULT_POSITION: Position = { x: 50, y: 50 };

function parsePosition(value: string | undefined): Position {
  const match = value?.match(/^([\d.]+)%\s+([\d.]+)%$/);
  if (!match) return DEFAULT_POSITION;
  return { x: Number(match[1]), y: Number(match[2]) };
}

export default function HeroSettingsForm({
  initial,
  initialPositions,
}: {
  initial: Record<FieldName, string>;
  initialPositions: Record<FieldName, string>;
}) {
  const [urls, setUrls] = useState<Record<FieldName, string>>(initial);
  const [previews, setPreviews] = useState<Record<FieldName, string>>(initial);
  const [fileNames, setFileNames] = useState<Partial<Record<FieldName, string>>>({});
  const [dims, setDims] = useState<Partial<Record<FieldName, string>>>({});
  const [positions, setPositions] = useState<Record<FieldName, Position>>(() =>
    FIELDS.reduce(
      (acc, { name }) => ({ ...acc, [name]: parsePosition(initialPositions[name]) }),
      {} as Record<FieldName, Position>
    )
  );
  const [dragging, setDragging] = useState<Partial<Record<FieldName, boolean>>>({});
  const fileInputs = useRef<Partial<Record<FieldName, HTMLInputElement>>>({});
  const dragStart = useRef<
    Partial<Record<FieldName, { x: number; y: number; position: Position }>>
  >({});

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
    setPreviews((p) => ({ ...p, [name]: value }));
    if (value) loadDimensions(name, value);
    else setDims((d) => ({ ...d, [name]: undefined }));
  }

  function handleFileChange(name: FieldName, file: File | undefined) {
    if (!file) return;
    setUrls((u) => ({ ...u, [name]: "" }));
    setFileNames((f) => ({ ...f, [name]: file.name }));
    const objectUrl = URL.createObjectURL(file);
    setPreviews((p) => ({ ...p, [name]: objectUrl }));
    loadDimensions(name, objectUrl);
  }

  function handleRemoveImage(name: FieldName) {
    setUrls((u) => ({ ...u, [name]: "" }));
    setPreviews((p) => ({ ...p, [name]: "" }));
    setFileNames((f) => ({ ...f, [name]: undefined }));
    setDims((d) => ({ ...d, [name]: undefined }));
    setPositions((p) => ({ ...p, [name]: DEFAULT_POSITION }));
    const input = fileInputs.current[name];
    if (input) input.value = "";
  }

  function handleDragStart(name: FieldName, e: React.PointerEvent<HTMLElement>) {
    if (!previews[name]) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current[name] = { x: e.clientX, y: e.clientY, position: positions[name] };
    setDragging((d) => ({ ...d, [name]: true }));
  }

  function handleDragMove(name: FieldName, e: React.PointerEvent<HTMLElement>) {
    const start = dragStart.current[name];
    if (!start) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dxPct = ((e.clientX - start.x) / rect.width) * 100;
    const dyPct = ((e.clientY - start.y) / rect.height) * 100;
    const clamp = (n: number) => Math.min(100, Math.max(0, n));
    // Dragging the image right reveals what was hidden on the left, i.e. a
    // lower object-position% - so the pointer delta subtracts, not adds.
    setPositions((p) => ({
      ...p,
      [name]: { x: clamp(start.position.x - dxPct), y: clamp(start.position.y - dyPct) },
    }));
  }

  function handleDragEnd(name: FieldName, e: React.PointerEvent<HTMLElement>) {
    if (!dragStart.current[name]) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragStart.current[name] = undefined;
    setDragging((d) => ({ ...d, [name]: false }));
  }

  return (
    <>
      <form action={updateSiteSettings} className="flex flex-col gap-7 mt-8">
        {FIELDS.map(({ name, label, recommended, previewWidth, previewHeight }) => {
          const preview = previews[name];
          const position = positions[name];
          return (
            <div key={name} className="field-label">
              {label}
              <span
                className="ph-photo rounded-2xl w-full mt-2 block relative overflow-hidden touch-none select-none"
                style={{
                  aspectRatio: `${previewWidth} / ${previewHeight}`,
                  cursor: preview ? (dragging[name] ? "grabbing" : "grab") : undefined,
                }}
                onPointerDown={(e) => handleDragStart(name, e)}
                onPointerMove={(e) => handleDragMove(name, e)}
                onPointerUp={(e) => handleDragEnd(name, e)}
                onPointerCancel={(e) => handleDragEnd(name, e)}
              >
                {preview && (
                  <>
                    <img
                      src={preview}
                      alt={`${label} preview`}
                      draggable={false}
                      className="h-full w-full object-cover pointer-events-none"
                      style={{ objectPosition: `${position.x}% ${position.y}%` }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white">
                      Drag to reposition
                    </span>
                  </>
                )}
              </span>
              <div className="flex items-center justify-between text-xs text-ink-faint mt-1.5">
                <span>{dims[name] ?? " "}</span>
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
                className="hidden"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputs.current[name]?.click()}
                  className="field flex items-center text-left cursor-pointer truncate"
                >
                  {fileNames[name] ?? "Choose file…"}
                </button>
                {preview && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(name)}
                    className="shrink-0 text-xs text-ink-faint cursor-pointer transition-colors hover:text-warn-ink"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input type="hidden" name={`${name}_position_x`} value={position.x} />
              <input type="hidden" name={`${name}_position_y`} value={position.y} />
            </div>
          );
        })}
        <SubmitButton>Save changes</SubmitButton>
      </form>

      <form action={resetSiteSettings} className="mt-4">
        <ConfirmSubmitButton
          confirmTitle="Reset the hero image to default?"
          confirmBody="Clears the image and focus point for every breakpoint."
          confirmLabel="Reset"
          className="text-sm text-ink-faint cursor-pointer transition-colors hover:text-warn-ink disabled:opacity-60"
        >
          Reset to default
        </ConfirmSubmitButton>
      </form>
    </>
  );
}
