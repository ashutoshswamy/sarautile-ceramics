import { Trash2 } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { createCollection, deleteCollection } from "./actions";

const RESERVED_SLUGS = new Set(["new-arrivals", "bestsellers"]);

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
        when it has products in it - the <code>new-arrivals</code> and{" "}
        <code>bestsellers</code> slugs are what the homepage looks for.
        Renaming or deleting either (marked below) empties that row on the
        homepage.
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
            {RESERVED_SLUGS.has(c.slug) && (
              <span className="badge bg-warn-bg text-warn-ink">Used by homepage</span>
            )}
            <form action={deleteCollection.bind(null, c.slug)} className="ml-auto">
              <ConfirmSubmitButton
                confirmTitle={`Delete "${c.name}"?`}
                confirmBody="Products in this collection keep their other details but drop out of it."
                aria-label={`Delete ${c.name}`}
                className="text-ink-faint cursor-pointer transition-colors hover:text-warn-ink disabled:opacity-60"
              >
                <Trash2 size={15} strokeWidth={1.8} />
              </ConfirmSubmitButton>
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
