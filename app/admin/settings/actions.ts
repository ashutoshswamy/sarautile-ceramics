"use server";

import { revalidatePath } from "next/cache";
import { requireSection } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirectWithToast, errorMessage } from "@/lib/actionRedirect";

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

function resolvePosition(formData: FormData, breakpoint: (typeof BREAKPOINTS)[number]): string {
  const x = Number(formData.get(`hero_image_${breakpoint}_position_x`));
  const y = Number(formData.get(`hero_image_${breakpoint}_position_y`));
  const clamp = (n: number) => (Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 50);
  return `${clamp(x)}% ${clamp(y)}%`;
}

export async function updateSiteSettings(formData: FormData) {
  const { log } = await requireSection("settings");
  const supabase = getSupabaseAdmin();

  try {
    const [mobile, tablet, desktop] = await Promise.all(
      BREAKPOINTS.map((bp) => resolveImageUrl(supabase, formData, bp))
    );

    const { error } = await supabase
      .from("site_settings")
      .update({
        hero_image_mobile: mobile,
        hero_image_tablet: tablet,
        hero_image_desktop: desktop,
        hero_image_mobile_position: resolvePosition(formData, "mobile"),
        hero_image_tablet_position: resolvePosition(formData, "tablet"),
        hero_image_desktop_position: resolvePosition(formData, "desktop"),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);
  } catch (err) {
    redirectWithToast("/admin/settings", errorMessage(err), "error");
  }

  await log("Updated hero images");
  revalidateHero();
  redirectWithToast("/admin/settings", "Changes saved.");
}

export async function resetSiteSettings() {
  const { log } = await requireSection("settings");
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .update({
      hero_image_mobile: null,
      hero_image_tablet: null,
      hero_image_desktop: null,
      hero_image_mobile_position: "50% 50%",
      hero_image_tablet_position: "50% 50%",
      hero_image_desktop_position: "50% 50%",
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) redirectWithToast("/admin/settings", error.message, "error");

  await log("Reset hero images to default");
  revalidateHero();
  redirectWithToast("/admin/settings", "Reset to default.");
}
