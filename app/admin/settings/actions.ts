"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const BREAKPOINTS = ["mobile", "tablet", "desktop"] as const;

function revalidateHero() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

// A chosen file wins over a pasted URL for that breakpoint. Returns null for
// "leave blank / fall back to default".
async function resolveImageUrl(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  formData: FormData,
  breakpoint: (typeof BREAKPOINTS)[number]
): Promise<string | null> {
  const file = formData.get(`hero_image_${breakpoint}_file`);
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`${breakpoint} upload must be an image file.`);
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${breakpoint}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("hero-images").upload(path, file, {
      contentType: file.type,
    });
    if (error) throw new Error(error.message);
    return supabase.storage.from("hero-images").getPublicUrl(path).data.publicUrl;
  }
  return (formData.get(`hero_image_${breakpoint}`) as string) || null;
}

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const [mobile, tablet, desktop] = await Promise.all(
    BREAKPOINTS.map((bp) => resolveImageUrl(supabase, formData, bp))
  );

  const { error } = await supabase
    .from("site_settings")
    .update({
      hero_image_mobile: mobile,
      hero_image_tablet: tablet,
      hero_image_desktop: desktop,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidateHero();
}

export async function resetSiteSettings() {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .update({
      hero_image_mobile: null,
      hero_image_tablet: null,
      hero_image_desktop: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidateHero();
}
