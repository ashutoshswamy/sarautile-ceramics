"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { slugify } from "@/lib/slugify";
import { redirectWithToast, errorMessage } from "@/lib/actionRedirect";

function revalidateStorefront(slug: string) {
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${slug}`);
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
}

const MAX_PRODUCT_IMAGES = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

function assertValidImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Product photos must be image files.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Product photos must be under ${MAX_IMAGE_BYTES / (1024 * 1024)}MB.`);
  }
}

async function uploadImage(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  file: File,
  slug: string
): Promise<string> {
  assertValidImage(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${slug}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

// Uploads the admin's chosen photo to Supabase Storage and returns its public
// URL, or null if no file was chosen (existing photo is left untouched).
async function resolvePhotoUrl(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  formData: FormData,
  slug: string
): Promise<string | null> {
  const file = formData.get("photo_file");
  if (!(file instanceof File) || file.size === 0) return null;
  return uploadImage(supabase, file, slug);
}

// Uploads every non-empty file under `photo_files`, up to MAX_PRODUCT_IMAGES.
async function uploadProductImages(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  formData: FormData,
  slug: string
): Promise<string[]> {
  const files = formData.getAll("photo_files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_PRODUCT_IMAGES) {
    throw new Error(`You can upload at most ${MAX_PRODUCT_IMAGES} images per product.`);
  }
  return Promise.all(files.map((file) => uploadImage(supabase, file, slug)));
}

export async function updateProduct(slug: string, formData: FormData) {
  await requireAdmin(); // re-checked here - never trust that the page render alone guarded this
  const supabase = getSupabaseAdmin();

  try {
    const imageUrl = await resolvePhotoUrl(supabase, formData, slug);

    const { error } = await supabase
      .from("products")
      .update({
        name: formData.get("name"),
        price: Number(formData.get("price")),
        weight: formData.get("weight") || null,
        left_count: Number(formData.get("left_count")),
        photo_label: formData.get("photo_label"),
        category_slug: formData.get("category_slug") || null,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      })
      .eq("slug", slug);
    if (error) throw new Error(error.message);

    // Collections membership: replace wholesale rather than diff - simplest
    // correct thing for a handful of checkboxes.
    const collectionSlugs = formData.getAll("collections").map(String);
    const { error: delErr } = await supabase
      .from("product_collections")
      .delete()
      .eq("product_slug", slug);
    if (delErr) throw new Error(delErr.message);
    if (collectionSlugs.length > 0) {
      const { error: insErr } = await supabase
        .from("product_collections")
        .insert(collectionSlugs.map((collection_slug) => ({ product_slug: slug, collection_slug })));
      if (insErr) throw new Error(insErr.message);
    }
  } catch (err) {
    redirectWithToast(`/admin/products/${slug}`, errorMessage(err), "error");
  }

  revalidateStorefront(slug);
  redirectWithToast(`/admin/products/${slug}`, "Changes saved.");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(name);

  try {
    const imageUrls = await uploadProductImages(supabase, formData, slug);

    const { error } = await supabase.from("products").insert({
      slug,
      name: formData.get("name"),
      price: Number(formData.get("price")),
      weight: formData.get("weight") || null,
      left_count: Number(formData.get("left_count")),
      photo_label: formData.get("photo_label"),
      image_url: imageUrls[0] ?? null,
      category_slug: formData.get("category_slug") || null,
    });
    if (error) {
      throw new Error(
        error.code === "23505" ? `A product with slug "${slug}" already exists.` : error.message
      );
    }

    if (imageUrls.length > 1) {
      const { error: imgErr } = await supabase.from("product_images").insert(
        imageUrls.slice(1).map((url, i) => ({ product_slug: slug, url, position: i }))
      );
      if (imgErr) throw new Error(imgErr.message);
    }

    const collectionSlugs = formData.getAll("collections").map(String);
    if (collectionSlugs.length > 0) {
      const { error: colErr } = await supabase
        .from("product_collections")
        .insert(collectionSlugs.map((collection_slug) => ({ product_slug: slug, collection_slug })));
      if (colErr) throw new Error(colErr.message);
    }
  } catch (err) {
    redirectWithToast("/admin/products/new", errorMessage(err), "error");
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirectWithToast(`/admin/products/${slug}`, "Product created.");
}

export async function deleteProduct(slug: string) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("products").delete().eq("slug", slug);
  if (error) redirectWithToast(`/admin/products/${slug}`, error.message, "error");

  revalidateStorefront(slug);
  redirectWithToast("/admin/products", "Product deleted.");
}

const MAX_TOTAL_IMAGES = MAX_PRODUCT_IMAGES + 1; // +1 for the cover photo

export async function addProductImages(slug: string, formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  try {
    const { count } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_slug", slug);
    const { data: existing, error: posErr } = await supabase
      .from("product_images")
      .select("position")
      .eq("product_slug", slug)
      .order("position", { ascending: false })
      .limit(1)
      .returns<{ position: number }[]>();
    if (posErr) throw new Error(posErr.message);

    const files = formData.getAll("photo_files").filter((f): f is File => f instanceof File && f.size > 0);
    if ((count ?? 0) + files.length > MAX_TOTAL_IMAGES) {
      throw new Error(`A product can have at most ${MAX_TOTAL_IMAGES} photos total.`);
    }

    const urls = await Promise.all(files.map((file) => uploadImage(supabase, file, slug)));
    if (urls.length === 0) {
      throw new Error("Choose at least one photo to add.");
    }

    const nextPosition = (existing?.[0]?.position ?? -1) + 1;
    const { error } = await supabase.from("product_images").insert(
      urls.map((url, i) => ({ product_slug: slug, url, position: nextPosition + i }))
    );
    if (error) throw new Error(error.message);
  } catch (err) {
    redirectWithToast(`/admin/products/${slug}`, errorMessage(err), "error");
  }

  revalidateStorefront(slug);
  redirectWithToast(`/admin/products/${slug}`, "Photos added.");
}

export async function deleteProductImage(slug: string, imageId: number) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("product_images").delete().eq("id", imageId);
  if (error) redirectWithToast(`/admin/products/${slug}`, error.message, "error");

  revalidateStorefront(slug);
  redirectWithToast(`/admin/products/${slug}`, "Photo removed.");
}

export async function reorderProductImage(
  slug: string,
  imageId: number,
  direction: "up" | "down"
) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  try {
    const { data: images, error } = await supabase
      .from("product_images")
      .select("id, position")
      .eq("product_slug", slug)
      .order("position", { ascending: true })
      .returns<{ id: number; position: number }[]>();
    if (error) throw new Error(error.message);

    const images_ = images ?? [];
    const idx = images_.findIndex((i) => i.id === imageId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapIdx < 0 || swapIdx >= images_.length) {
      revalidateStorefront(slug);
      return;
    }

    const a = images_[idx];
    const b = images_[swapIdx];
    const [r1, r2] = await Promise.all([
      supabase.from("product_images").update({ position: b.position }).eq("id", a.id),
      supabase.from("product_images").update({ position: a.position }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) throw new Error((r1.error ?? r2.error)!.message);
  } catch (err) {
    redirectWithToast(`/admin/products/${slug}`, errorMessage(err), "error");
  }

  revalidateStorefront(slug);
  redirectWithToast(`/admin/products/${slug}`, "Order updated.");
}
