import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Trash2 } from "lucide-react";
import { getMug } from "@/lib/queries";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import { updateMug, deleteMug, addGlaze, deleteGlaze } from "./actions";

export default async function AdminEditMugPage(
  props: PageProps<"/admin/mugs/[slug]">
) {
  const { slug } = await props.params;
  const supabase = getSupabaseAdmin();

  const [mug, { data: categories }, { data: collections }, { data: memberships }] =
    await Promise.all([
      getMug(slug),
      supabase.from("categories").select("slug, name").order("name").returns<
        { slug: string; name: string }[]
      >(),
      supabase.from("collections").select("slug, name").order("name").returns<
        { slug: string; name: string }[]
      >(),
      supabase
        .from("mug_collections")
        .select("collection_slug")
        .eq("mug_slug", slug)
        .returns<{ collection_slug: string }[]>(),
    ]);
  if (!mug) notFound();

  const memberSlugs = new Set((memberships ?? []).map((m) => m.collection_slug));

  return (
    <div className="max-w-[560px]">
      <nav className="flex items-center gap-1 text-xs text-ink-faint mb-4">
        <Link href="/admin/mugs" className="text-ink-faint no-underline hover:text-ink">
          Mugs
        </Link>
        <ChevronRight size={13} strokeWidth={1.7} aria-hidden />
        <span className="text-ink-soft">{mug.name}</span>
      </nav>
      <div className="flex items-start gap-4">
        <h1 className="display-2">{mug.name}</h1>
        <form action={deleteMug.bind(null, mug.slug)} className="ml-auto">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-sm text-ink-faint cursor-pointer transition-colors hover:text-warn-ink"
          >
            <Trash2 size={14} strokeWidth={1.8} aria-hidden />
            Delete
          </button>
        </form>
      </div>

      <form action={updateMug.bind(null, mug.slug)} className="flex flex-col gap-4 mt-8">
        <label className="field-label">
          Name
          <input name="name" defaultValue={mug.name} required className="field" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="field-label">
            Price (₹)
            <input
              name="price"
              type="number"
              min={0}
              defaultValue={mug.price}
              required
              className="field"
            />
          </label>
          <label className="field-label">
            Size (oz)
            <input
              name="oz"
              type="number"
              min={1}
              defaultValue={mug.oz}
              required
              className="field"
            />
          </label>
        </div>
        <label className="field-label">
          Note (shown under the name)
          <input name="note" defaultValue={mug.note} required className="field" />
        </label>
        <label className="field-label">
          In stock
          <input
            name="left_count"
            type="number"
            min={0}
            defaultValue={parseInt(mug.left, 10) || 0}
            required
            className="field"
          />
        </label>
        <label className="field-label">
          Photo label (picks a stock photo deterministically)
          <input name="photo_label" defaultValue={mug.photoLabel} required className="field" />
        </label>

        <label className="field-label">
          Category
          <select
            name="category_slug"
            defaultValue={mug.categorySlug ?? ""}
            className="field"
          >
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
                  <input
                    type="checkbox"
                    name="collections"
                    value={c.slug}
                    defaultChecked={memberSlugs.has(c.slug)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <SubmitButton>Save changes</SubmitButton>
      </form>

      <div className="mt-10">
        <span className="kicker">Glazes</span>
        <div className="flex flex-col mt-3">
          {mug.glazes.map((g) => (
            <div key={g.name} className="flex items-center gap-3 py-2.5 border-b border-rule text-sm">
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ background: g.hex }}
                aria-hidden
              />
              <span className="text-ink">{g.name}</span>
              <span className="text-xs text-ink-faint truncate">{g.desc}</span>
              <form
                action={deleteGlaze.bind(null, mug.slug, g.name)}
                className="ml-auto"
              >
                <button
                  type="submit"
                  aria-label={`Delete glaze ${g.name}`}
                  className="text-ink-faint cursor-pointer transition-colors hover:text-warn-ink"
                >
                  <Trash2 size={14} strokeWidth={1.8} />
                </button>
              </form>
            </div>
          ))}
          {mug.glazes.length === 0 && (
            <p className="text-sm text-ink-faint py-2.5">No glazes yet.</p>
          )}
        </div>

        <form
          action={addGlaze.bind(null, mug.slug)}
          className="grid grid-cols-2 gap-3 mt-4"
        >
          <input name="name" required placeholder="Glaze name" className="field" />
          <input
            name="hex"
            required
            placeholder="#c67139"
            pattern="^#[0-9a-fA-F]{6}$"
            title="Hex colour, eg. #c67139"
            className="field"
          />
          <input
            name="description"
            required
            placeholder="Short description"
            className="field col-span-2"
          />
          <input
            name="shot"
            required
            placeholder="Photo label"
            className="field col-span-2"
          />
          <SubmitButton>Add glaze</SubmitButton>
        </form>
      </div>
    </div>
  );
}
