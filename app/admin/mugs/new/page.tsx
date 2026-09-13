import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import { createMug } from "../[slug]/actions";

export default async function AdminNewMugPage() {
  const { data: categories } = await getSupabaseAdmin()
    .from("categories")
    .select("slug, name")
    .order("name")
    .returns<{ slug: string; name: string }[]>();

  return (
    <div className="max-w-[560px]">
      <nav className="flex items-center gap-1 text-xs text-ink-faint mb-4">
        <Link href="/admin/mugs" className="text-ink-faint no-underline hover:text-ink">
          Mugs
        </Link>
        <ChevronRight size={13} strokeWidth={1.7} aria-hidden />
        <span className="text-ink-soft">New</span>
      </nav>
      <h1 className="display-2">New mug</h1>
      <p className="lede text-[0.95rem] mt-2">
        You can add glazes once it&apos;s created.
      </p>

      <form action={createMug} className="flex flex-col gap-4 mt-8">
        <label className="field-label">
          Name
          <input name="name" required placeholder="Ember Tall" className="field" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="field-label">
            Price (₹)
            <input name="price" type="number" min={0} required defaultValue={1150} className="field" />
          </label>
          <label className="field-label">
            Size (oz)
            <input name="oz" type="number" min={1} required defaultValue={12} className="field" />
          </label>
        </div>
        <label className="field-label">
          Note (shown under the name)
          <input name="note" required placeholder="12 oz, wheel-thrown" className="field" />
        </label>
        <label className="field-label">
          In stock
          <input name="left_count" type="number" min={0} required defaultValue={0} className="field" />
        </label>
        <label className="field-label">
          Photo label (picks a stock photo deterministically)
          <input name="photo_label" required placeholder="ember tall mug" className="field" />
        </label>
        <label className="field-label">
          Category
          <select name="category_slug" defaultValue="" className="field">
            <option value="">None</option>
            {(categories ?? []).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <SubmitButton>Create mug</SubmitButton>
      </form>
    </div>
  );
}
