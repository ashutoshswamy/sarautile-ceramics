import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import FilePickerField from "@/components/admin/FilePickerField";
import { createProduct } from "../[slug]/actions";

export default async function AdminNewProductPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: categories }, { data: collections }] = await Promise.all([
    supabase.from("categories").select("slug, name").order("name").returns<
      { slug: string; name: string }[]
    >(),
    supabase.from("collections").select("slug, name").order("name").returns<
      { slug: string; name: string }[]
    >(),
  ]);

  return (
    <div className="max-w-[560px]">
      <nav className="flex items-center gap-1 text-xs text-ink-faint mb-4">
        <Link href="/admin/products" className="text-ink-faint no-underline hover:text-ink">
          Products
        </Link>
        <ChevronRight size={13} strokeWidth={1.7} aria-hidden />
        <span className="text-ink-soft">New</span>
      </nav>
      <h1 className="display-2">New product</h1>

      <form action={createProduct} className="flex flex-col gap-4 mt-8">
        <label className="field-label">
          Name
          <input name="name" required placeholder="Ember Tall Mug" className="field" />
        </label>
        <label className="field-label">
          Price (₹)
          <input name="price" type="number" min={0} required defaultValue={1150} className="field" />
        </label>
        <label className="field-label">
          Weight (optional)
          <input name="weight" placeholder="340 g" className="field" />
        </label>
        <label className="field-label">
          In stock
          <input name="left_count" type="number" min={0} required defaultValue={0} className="field" />
        </label>
        <label className="field-label">
          Photo label (alt text, and the empty-state placeholder until a photo is uploaded)
          <input name="photo_label" required placeholder="ember tall mug" className="field" />
        </label>
        <label className="field-label">
          Photos (up to 10, 5MB each — first one is the cover)
          <FilePickerField name="photo_files" accept="image/*" multiple />
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

        {(collections ?? []).length > 0 && (
          <div>
            <span className="kicker">Collections</span>
            <div className="flex flex-wrap gap-3 mt-2.5">
              {(collections ?? []).map((c) => (
                <label
                  key={c.slug}
                  className="inline-flex items-center gap-2 text-sm text-ink-soft"
                >
                  <input type="checkbox" name="collections" value={c.slug} />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <SubmitButton>Create product</SubmitButton>
      </form>
    </div>
  );
}
