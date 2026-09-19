import { Trash2 } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { createCategory, deleteCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const { data: categories } = await getSupabaseAdmin()
    .from("categories")
    .select("slug, name")
    .order("name")
    .returns<{ slug: string; name: string }[]>();

  return (
    <div className="max-w-[520px]">
      <h1 className="display-2">Categories</h1>
      <p className="lede text-[0.95rem] mt-2">
        Product types shoppers browse by, eg. Mugs, Bowls, Plates.
      </p>

      <form action={createCategory} className="flex gap-3 mt-8">
        <input
          name="name"
          required
          placeholder="Category name"
          className="field flex-1"
        />
        <SubmitButton>Add</SubmitButton>
      </form>

      <div className="flex flex-col mt-6">
        {(categories ?? []).map((c) => (
          <div
            key={c.slug}
            className="flex items-center gap-3 py-3 border-b border-rule text-sm"
          >
            <span className="text-ink">{c.name}</span>
            <span className="text-xs text-ink-faint">/{c.slug}</span>
            <form action={deleteCategory.bind(null, c.slug)} className="ml-auto">
              <ConfirmSubmitButton
                confirmTitle={`Delete "${c.name}"?`}
                confirmBody="Products in this category keep their other details but lose their category."
                aria-label={`Delete ${c.name}`}
                className="text-ink-faint cursor-pointer transition-colors hover:text-warn-ink disabled:opacity-60"
              >
                <Trash2 size={15} strokeWidth={1.8} />
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
        {(categories ?? []).length === 0 && (
          <p className="text-sm text-ink-faint py-3">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
