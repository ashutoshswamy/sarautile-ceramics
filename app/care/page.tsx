import { care } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Care — Sarautile Ceramics" };

export default function CarePage() {
  return (
    <div className="container-x section-tight max-w-[640px]">
      <span className="kicker">Care</span>
      <h1 className="display-2 mt-3">Looking after it</h1>
      <p className="lede mt-4">
        Short version: use it like a mug. Longer version below.
      </p>

      <div className="flex flex-col gap-3 mt-10">
        {care.map((c) => (
          <div key={c.q} className="card p-5.5 rise">
            <div className="flex items-center gap-2.5">
              <span
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: c.tagBg, color: c.tagFg }}
              >
                {c.verdict}
              </span>
              <h4 className="display-3 text-[1.05rem]">{c.q}</h4>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft mt-2.5">
              {c.a}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 px-5.5 py-5 rounded-3xl border border-rule">
        <h4 className="font-medium">Something went wrong?</h4>
        <p className="text-sm leading-relaxed text-ink-soft mt-2">
          Email a photo to{" "}
          <a href="mailto:hello@sarautileceramics.in">
            hello@sarautileceramics.in
          </a>{" "}
          and we&apos;ll sort it. Usually that means a new mug in the post.
        </p>
      </div>
    </div>
  );
}
