import { ArrowUpDown, Tag } from "lucide-react";
import MugCard from "@/components/MugCard";
import { glazeFilters, mugs } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All the mugs - Sarautile Ceramics",
};

export default function MugsPage() {
  return (
    <div className="container-x section-tight grid gap-10 md:grid-cols-[236px_1fr] lg:gap-14">
      <aside className="flex flex-col gap-8 md:sticky md:top-20 md:self-start">
        <div>
          <h1 className="display-2">All the mugs</h1>
          <p className="lede text-[0.95rem] mt-3">
            Twelve in stock today. Filter by glaze - the colours are
            hand-mixed so no two batches match exactly.
          </p>
        </div>

        <div>
          <span className="kicker">Glaze</span>
          <div className="flex flex-col gap-2 mt-3.5">
            {glazeFilters.map((g) => (
              <span
                key={g.name}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-rule text-sm cursor-pointer transition-colors hover:border-rule-strong"
              >
                <span
                  className="w-4 h-4 rounded-full shadow-[inset_0_0_0_1px_rgba(31,29,27,.18)]"
                  style={{ background: g.hex }}
                />
                {g.name}
                <span className="ml-auto text-xs text-ink-faint">
                  {g.count}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="kicker">Size</span>
          <div className="flex mt-3.5 border border-rule-strong rounded-full overflow-hidden text-sm">
            <span className="flex-1 text-center py-2 bg-ink text-paper">
              All
            </span>
            <span className="flex-1 text-center py-2">8oz</span>
            <span className="flex-1 text-center py-2">12oz</span>
          </div>
        </div>

        <div className="card bg-sage-bg border-transparent p-5">
          <h4 className="flex items-center gap-2 display-3 text-[1.05rem] text-sage-ink">
            <Tag size={16} strokeWidth={1.7} aria-hidden />
            Seconds shelf
          </h4>
          <p className="text-xs leading-relaxed text-sage-ink-soft mt-2">
            Wonky handles and glaze skips, half price. Perfectly good for
            coffee.
          </p>
        </div>
      </aside>

      <div>
        <div className="flex items-center gap-3 mb-8 text-sm text-ink-soft">
          <span>{mugs.length} mugs</span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <ArrowUpDown size={13} strokeWidth={1.7} aria-hidden />
            Sort: newest firing
          </span>
        </div>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {mugs.map((mug) => (
            <MugCard key={mug.slug} mug={mug} showLeft />
          ))}
        </div>
      </div>
    </div>
  );
}
