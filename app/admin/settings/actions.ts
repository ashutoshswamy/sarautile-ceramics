"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const DEFAULT_HERO_PHOTO_LABEL = "sarautile hero spread";

function revalidateHero() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .update({
      hero_photo_label: formData.get("hero_photo_label"),
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
      hero_photo_label: DEFAULT_HERO_PHOTO_LABEL,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidateHero();
}
