import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Trash2, ChevronUp, ChevronDown, ImagePlus } from "lucide-react";
import { getProduct } from "@/lib/queries";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import SubmitButton from "@/components/admin/SubmitButton";
import FilePickerField from "@/components/admin/FilePickerField";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import {
  updateProduct,
  deleteProduct,
  addProductImages,
  deleteProductImage,
  reorderProductImage,
} from "./actions";

type GalleryImage = { id: number; url: string; position: number };

export default async function AdminEditProductPage(
  props: PageProps<"/admin/products/[slug]">
) {
  const { slug } = await props.params;
  const supabase = getSupabaseAdmin();

  const [product, { data: categories }, { data: collections }, { data: memberships }, { data: gallery }] =
    await Promise.all([
      getProduct(slug),
      supabase.from("categories").select("slug, name").order("name").returns<
        { slug: string; name: string }[]
      >(),
      supabase.from("collections").select("slug, name").order("name").returns<
        { slug: string; name: string }[]
      >(),
      supabase
        .from("product_collections")
        .select("collection_slug")
        .eq("product_slug", slug)
        .returns<{ collection_slug: string }[]>(),
      supabase
        .from("product_images")
        .select("id, url, position")
        .eq("product_slug", slug)
        .order("position")
        .returns<GalleryImage[]>(),
    ]);
  if (!product) notFound();

  const memberSlugs = new Set((memberships ?? []).map((m) => m.collection_slug));
  const images = gallery ?? [];

  return (
    <div className="max-w-[560px]">
      <nav className="flex items-center gap-1 text-xs text-ink-faint mb-4">
        <Link href="/admin/products" className="text-ink-faint no-underline hover:text-ink">
          Products
        </Link>
        <ChevronRight size={13} strokeWidth={1.7} aria-hidden />
        <span className="text-ink-soft">{product.name}</span>
      </nav>
      <div className="flex items-start gap-4">
        <h1 className="display-2">{product.name}</h1>
        <form action={deleteProduct.bind(null, product.slug)} className="ml-auto">
          <ConfirmSubmitButton
            confirmTitle={`Delete "${product.name}"?`}
            confirmBody="This removes the product, its photos, and its reviews. This can't be undone."
            className="inline-flex items-center gap-1.5 text-sm text-ink-faint cursor-pointer transition-colors hover:text-warn-ink disabled:opacity-60"
          >
            <Trash2 size={14} strokeWidth={1.8} aria-hidden />
            Delete
          </ConfirmSubmitButton>
        </form>
      </div>

      <form
        action={updateProduct.bind(null, product.slug)}
        encType="multipart/form-data"
        className="flex flex-col gap-4 mt-8"
      >
        <div className="flex items-center gap-4">
          <PlaceholderPhoto
            label={product.photoLabel}
            src={product.imageUrl}
            rounded="rounded-xl"
            className="w-24 h-24 flex-none"
            sizes="96px"
          />
          <label className="field-label flex-1">
            Photo
            <FilePickerField name="photo_file" accept="image/*" />
          </label>
        </div>
        <label className="field-label">
          Name
          <input name="name" defaultValue={product.name} required className="field" />
        </label>
        <label className="field-label">
          Price (₹)
          <input
            name="price"
            type="number"
            min={0}
            defaultValue={product.price}
            required
            className="field"
          />
        </label>
        <label className="field-label">
          Weight (optional)
          <input name="weight" defaultValue={product.weight ?? ""} placeholder="340 g" className="field" />
        </label>
        <label className="field-label">
          In stock
          <input
            name="left_count"
            type="number"
            min={0}
            defaultValue={parseInt(product.left, 10) || 0}
            required
            className="field"
          />
        </label>
        <label className="field-label">
          Photo label (alt text, and the empty-state placeholder until a photo is uploaded)
          <input name="photo_label" defaultValue={product.photoLabel} required className="field" />
        </label>
        <label className="field-label">
          Description (shown on the product page)
          <textarea
            name="description"
            rows={4}
            defaultValue={product.description ?? ""}
            placeholder="A proper everyday piece: heavy enough to feel like something, light enough to handle with ease."
            className="field"
          />
        </label>

        <label className="field-label">
          Category
          <select
            name="category_slug"
            defaultValue={product.categorySlug ?? ""}
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

      <div className="mt-10 pt-8 border-t border-rule">
        <span className="kicker">Additional photos</span>
        <p className="text-sm text-ink-soft mt-1.5">
          Shown after the cover photo on the product page, in this order.
        </p>

        {images.length > 0 && (
          <div className="flex flex-col mt-4">
            {images.map((img, i) => (
              <div
                key={img.id}
                className="flex items-center gap-3 py-3 border-b border-rule"
              >
                <PlaceholderPhoto
                  label={`${product.name} photo ${i + 2}`}
                  src={img.url}
                  rounded="rounded-lg"
                  className="w-14 h-14 flex-none"
                  sizes="56px"
                />
                <div className="flex flex-col gap-1">
                  <form action={reorderProductImage.bind(null, product.slug, img.id, "up")}>
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label="Move up"
                      className="flex items-center justify-center w-6 h-6 text-ink-faint cursor-pointer transition-colors hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp size={15} strokeWidth={1.8} />
                    </button>
                  </form>
                  <form action={reorderProductImage.bind(null, product.slug, img.id, "down")}>
                    <button
                      type="submit"
                      disabled={i === images.length - 1}
                      aria-label="Move down"
                      className="flex items-center justify-center w-6 h-6 text-ink-faint cursor-pointer transition-colors hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={15} strokeWidth={1.8} />
                    </button>
                  </form>
                </div>
                <form
                  action={deleteProductImage.bind(null, product.slug, img.id)}
                  className="ml-auto"
                >
                  <ConfirmSubmitButton
                    confirmTitle="Remove this photo?"
                    className="flex items-center justify-center w-8 h-8 text-ink-faint cursor-pointer transition-colors hover:text-warn-ink disabled:opacity-60"
                  >
                    <Trash2 size={15} strokeWidth={1.8} />
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        )}

        <form
          action={addProductImages.bind(null, product.slug)}
          encType="multipart/form-data"
          className="flex items-end gap-3 mt-5"
        >
          <label className="field-label flex-1">
            Add photos
            <FilePickerField name="photo_files" accept="image/*" multiple />
          </label>
          <SubmitButton>
            <ImagePlus size={15} strokeWidth={1.8} aria-hidden />
            Add
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
