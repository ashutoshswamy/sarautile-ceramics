"use client";

import { useState } from "react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import type { Mug } from "@/lib/data";

const THUMBS = ["handle detail", "inside the rim", "base + stamp", "in a hand"];

export default function ProductDetail({ mug }: { mug: Mug }) {
  const [glazeIdx, setGlazeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const glaze = mug.glazes[glazeIdx];
  const lineTotal = mug.price * qty;

  const specs = [
    { k: "Holds", v: `${mug.oz} oz / ${Math.round(mug.oz * 29.57)} ml to the rim` },
    { k: "Body", v: "Grey stoneware, fired to 1240°C" },
    { k: "Dishwasher", v: "Yes. Microwave too." },
    { k: "Weight", v: "About 340 g — varies a bit" },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
      <div className="flex flex-col gap-3.5">
        <PlaceholderPhoto
          label={glaze.shot}
          rounded="rounded-[28px]"
          className="aspect-square p-4"
        />
        <div className="grid grid-cols-4 gap-3">
          {THUMBS.map((t) => (
            <PlaceholderPhoto
              key={t}
              label={t}
              rounded="rounded-[16px]"
              padding="p-2"
              className="aspect-square text-[9.5px]"
            />
          ))}
        </div>
      </div>

      <div>
        <span className="badge">Kiln 41 · 12 made</span>
        <h1 className="display-2 mt-4">{mug.name}</h1>
        <div className="flex items-baseline gap-3 mt-3">
          <span className="text-2xl font-medium">₹{mug.price}</span>
          <span className="text-sm text-ink-faint">
            {mug.oz} oz · wheel-thrown stoneware
          </span>
        </div>
        <p className="lede text-[0.95rem] mt-5">
          A proper everyday mug: heavy enough to feel like something, light
          enough to hold with two fingers. The handle is pulled by hand, so
          it fits a hand.
        </p>

        {mug.glazes.length > 1 && (
          <div className="mt-8">
            <div className="flex items-baseline gap-2.5">
              <span className="kicker">Glaze</span>
              <span className="text-sm font-medium">{glaze.name}</span>
              <span className="text-xs text-ink-faint">{glaze.desc}</span>
            </div>
            <div className="flex gap-3 mt-3.5">
              {mug.glazes.map((g, i) => (
                <button
                  key={g.name}
                  onClick={() => setGlazeIdx(i)}
                  title={g.name}
                  aria-label={`Choose glaze ${g.name}`}
                  className="w-[42px] h-[42px] rounded-full cursor-pointer transition-transform hover:scale-105"
                  style={{
                    background: g.hex,
                    boxShadow:
                      i === glazeIdx
                        ? "0 0 0 2px var(--paper), 0 0 0 4px var(--ink)"
                        : "inset 0 0 0 1px rgba(31,29,27,.18)",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col min-[420px]:flex-row gap-3 mt-8 items-stretch min-[420px]:items-center">
          <div className="flex items-center justify-between min-[420px]:justify-start gap-3.5 border border-rule-strong rounded-full px-4 py-2.5">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="cursor-pointer text-lg text-ink-soft leading-none hover:text-ink px-1"
              aria-label="Decrease quantity"
            >
              –
            </button>
            <span className="text-base min-w-[14px] text-center">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(9, q + 1))}
              className="cursor-pointer text-lg text-ink-soft leading-none hover:text-ink px-1"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button className="btn btn-primary flex-1">
            Add to cart — ₹{lineTotal}
          </button>
        </div>
        <p className="text-xs text-terracotta-dark mt-3">
          Only {mug.left} in {glaze.name}. Next firing opens 19 Sept.
        </p>

        <div className="flex flex-col border-t border-rule mt-8">
          {specs.map((s) => (
            <div
              key={s.k}
              className="flex gap-4 py-3.5 border-b border-rule text-sm"
            >
              <span className="w-[120px] flex-none text-ink-faint">{s.k}</span>
              <span>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
