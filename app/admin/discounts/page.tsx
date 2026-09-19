import { Trash2 } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import {
  createDiscountCode,
  createFirstPurchaseDiscountCode,
  deleteDiscountCode,
  toggleDiscountCode,
} from "./actions";

type DiscountRow = {
  code: string;
  percent_off: number;
  active: boolean;
  expires_at: string | null;
  first_purchase_only: boolean;
};

export default async function AdminDiscountsPage() {
  const { data } = await getSupabaseAdmin()
    .from("discount_codes")
    .select("code, percent_off, active, expires_at, first_purchase_only")
    .order("created_at", { ascending: false })
    .returns<DiscountRow[]>();

  const codes = data ?? [];

  return (
    <div className="max-w-[560px]">
      <h1 className="display-2">Discount codes</h1>
      <p className="lede text-[0.95rem] mt-2">
        Percent-off codes shoppers enter at checkout.
      </p>

      <form action={createDiscountCode} className="flex flex-wrap gap-3 mt-8 items-end">
        <label className="field-label">
          Code
          <input name="code" required placeholder="KILN10" className="field w-32 uppercase" />
        </label>
        <label className="field-label">
          % off
          <input
            name="percentOff"
            type="number"
            min={1}
            max={100}
            required
            placeholder="10"
            className="field w-20"
          />
        </label>
        <label className="field-label">
          Expires (optional)
          <input name="expiresAt" type="date" className="field w-40" />
        </label>
        <SubmitButton>Add</SubmitButton>
      </form>

      <div className="mt-10 pt-8 border-t border-rule">
        <h2 className="display-3 text-[1.15rem]">First-time customer discount</h2>
        <p className="text-sm text-ink-soft mt-1.5">
          A code that only works on a customer&apos;s first order - blocked at
          checkout for anyone with a prior order.
        </p>
        <form
          action={createFirstPurchaseDiscountCode}
          className="flex flex-wrap gap-3 mt-4 items-end"
        >
          <label className="field-label">
            Code
            <input name="code" required placeholder="WELCOME10" className="field w-32 uppercase" />
          </label>
          <label className="field-label">
            % off
            <input
              name="percentOff"
              type="number"
              min={1}
              max={100}
              required
              placeholder="10"
              className="field w-20"
            />
          </label>
          <label className="field-label">
            Expires (optional)
            <input name="expiresAt" type="date" className="field w-40" />
          </label>
          <SubmitButton>Add</SubmitButton>
        </form>
      </div>

      <div className="flex flex-col mt-8">
        {codes.map((c) => (
          <div
            key={c.code}
            className="flex items-center gap-3 py-3 border-b border-rule text-sm"
          >
            <span className="text-ink font-medium">{c.code}</span>
            <span className="text-xs text-ink-faint">{c.percent_off}% off</span>
            {c.expires_at && (
              <span className="text-xs text-ink-faint">
                until {new Date(c.expires_at).toLocaleDateString()}
              </span>
            )}
            {c.first_purchase_only && (
              <span className="badge bg-sage-bg text-sage-ink">First purchase</span>
            )}
            <form action={toggleDiscountCode.bind(null, c.code, !c.active)} className="ml-auto">
              <button
                type="submit"
                className={`badge cursor-pointer ${c.active ? "bg-sage-bg text-sage-ink" : "bg-canvas text-ink-faint"}`}
              >
                {c.active ? "Active" : "Disabled"}
              </button>
            </form>
            <form action={deleteDiscountCode.bind(null, c.code)}>
              <button
                type="submit"
                aria-label={`Delete ${c.code}`}
                className="text-ink-faint cursor-pointer transition-colors hover:text-warn-ink"
              >
                <Trash2 size={15} strokeWidth={1.8} />
              </button>
            </form>
          </div>
        ))}
        {codes.length === 0 && (
          <p className="text-sm text-ink-faint py-3">No codes yet.</p>
        )}
      </div>
    </div>
  );
}
