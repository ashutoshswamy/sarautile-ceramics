import { Package, Clock, IndianRupee, Palette, Stamp, Send } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { wholesaleFacts } from "@/lib/data";
import type { Metadata } from "next";

const FACT_ICON: Record<string, typeof Package> = {
  Minimum: Package,
  "Lead time": Clock,
  "Trade price": IndianRupee,
  "Custom glaze": Palette,
  Stamp: Stamp,
};

export const metadata: Metadata = { title: "Wholesale - Sarautile Ceramics" };

export default function WholesalePage() {
  return (
    <div className="container-x section-tight max-w-[900px]">
      <div className="grid gap-10 md:grid-cols-[.9fr_1.1fr] md:gap-12">
        <div>
          <span className="kicker">Wholesale</span>
          <h1 className="display-2 mt-3">Mugs for your café</h1>
          <p className="lede text-[0.95rem] mt-4">
            We take on about six wholesale accounts a year - enough that we
            can still throw everything ourselves. Minimum is 24 mugs, lead
            time is six to eight weeks, and yes we can match a glaze to your
            walls.
          </p>
          <div className="flex flex-col border-t border-rule mt-7">
            {wholesaleFacts.map((f) => {
              const FactIcon = FACT_ICON[f.k];
              return (
                <div
                  key={f.k}
                  className="flex gap-4 py-3 border-b border-rule text-sm"
                >
                  <span className="flex w-[116px] flex-none items-center gap-2 text-ink-faint">
                    {FactIcon && <FactIcon size={14} strokeWidth={1.7} aria-hidden />}
                    {f.k}
                  </span>
                  <span>{f.v}</span>
                </div>
              );
            })}
          </div>
          <PlaceholderPhoto
            label="café shelf, 24 mugs"
            rounded="rounded-[24px]"
            className="mt-7 aspect-[3/2]"
          />
        </div>

        <div className="card bg-sand border-transparent p-6 sm:p-7 rise">
          <h2 className="display-3">Tell us about the place</h2>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5 mt-5">
            <label className="field-label col-span-2">
              Business name
              <input className="field" />
            </label>
            <label className="field-label">
              Your name
              <input className="field" />
            </label>
            <label className="field-label">
              Email
              <input type="email" className="field" />
            </label>
            <label className="field-label col-span-2">
              Roughly how many mugs?
              <span className="flex border border-rule-strong rounded-full overflow-hidden bg-paper-tint text-sm">
                <span className="flex-1 text-center py-2.5 bg-ink text-paper">
                  24-48
                </span>
                <span className="flex-1 text-center py-2.5">48-100</span>
                <span className="flex-1 text-center py-2.5">100+</span>
              </span>
            </label>
            <label className="field-label col-span-2">
              Anything else
              <textarea
                placeholder="We're a two-room café in Mumbai, walls are dark green…"
                className="field"
              />
            </label>
          </div>
          <button className="btn btn-primary btn-block mt-5">
            <Send size={15} strokeWidth={1.8} aria-hidden />
            Send it over
          </button>
          <p className="text-xs text-ink-soft mt-3 text-center">
            Meera answers these, usually within a week.
          </p>
        </div>
      </div>
    </div>
  );
}
