import { Trash2 } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import { createCollection, deleteCollection } from "./actions";

export default async function AdminCollectionsPage() {
  const { data: collections } = await getSupabaseAdmin()
    .from("collections")
    .select("slug, name")
    .order("name")
    .returns<{ slug: string; name: string }[]>();

  return (
    <div className="max-w-[520px]">
      <h1 className="display-2">Collections</h1>
      <p className="lede text-[0.95rem] mt-2">
        Curated homepage rows. The homepage shows a row for a collection only
        when it has mugs in it - the <code>new-arrivals</code> and{" "}
        <code>bestsellers</code> slugs are what the homepage looks for.
      </p>

      <form action={createCollection} className="flex gap-3 mt-8">
        <input
          name="name"
          required
          placeholder="Collection name"
          className="field flex-1"
        />
        <SubmitButton>Add</SubmitButton>
      </form>

      <div className="flex flex-col mt-6">
        {(collections ?? []).map((c) => (
          <div
            key={c.slug}
            className="flex items-center gap-3 py-3 border-b border-rule text-sm"
          >
            <span className="text-ink">{c.name}</span>
            <span className="text-xs text-ink-faint">/{c.slug}</span>
            <form action={deleteCollection.bind(null, c.slug)} className="ml-auto">
              <button
                type="submit"
                aria-label={`Delete ${c.name}`}
                className="text-ink-faint cursor-pointer transition-colors hover:text-warn-ink"
              >
                <Trash2 size={15} strokeWidth={1.8} />
              </button>
            </form>
          </div>
        ))}
        {(collections ?? []).length === 0 && (
          <p className="text-sm text-ink-faint py-3">No collections yet.</p>
        )}
      </div>
    </div>
  );
}
