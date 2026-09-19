import { Package, Clock, IndianRupee, Palette, Stamp } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import WholesaleForm from "@/components/WholesaleForm";
import { wholesaleFacts } from "@/lib/data";
import type { Metadata } from "next";

const FACT_ICON: Record<string, typeof Package> = {
  Minimum: Package,
  "Lead time": Clock,
  "Trade price": IndianRupee,
  "Custom glaze": Palette,
  Stamp: Stamp,
};

export const metadata: Metadata = { title: "Wholesale - Sara Utile Ceramics" };

export default function WholesalePage() {
  return (
    <div className="container-x section-tight max-w-[900px]">
      <div className="grid gap-10 md:grid-cols-[.9fr_1.1fr] md:gap-12">
        <div>
          <span className="kicker">Wholesale</span>
          <h1 className="display-2 mt-3">Ceramics for your café or shop</h1>
          <p className="lede text-[0.95rem] mt-4">
            We take on about six wholesale accounts a year - enough that we
            can still throw everything ourselves. Minimum is 24 pieces, lead
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
            label="café shelf, 24 pieces"
            rounded="rounded-[24px]"
            className="mt-7 aspect-[3/2]"
          />
        </div>

        <WholesaleForm />
      </div>
    </div>
  );
}
