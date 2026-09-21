"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirectWithToast } from "@/lib/actionRedirect";

function revalidateInstagram() {
  revalidatePath("/admin/instagram");
  revalidatePath("/");
}

const POST_URL_RE = /^https:\/\/(www\.)?instagram\.com\/(p|reel)\/[^/?#]+/i;

export async function addInstagramPost(formData: FormData) {
  await requireAdmin();
  const url = String(formData.get("url") ?? "").trim();
  if (!POST_URL_RE.test(url)) {
    redirectWithToast(
      "/admin/instagram",
      "Paste a full instagram.com/p/... or /reel/... link.",
      "error"
    );
  }

  const { error } = await getSupabaseAdmin().from("instagram_posts").insert({ url });
  if (error) redirectWithToast("/admin/instagram", error.message, "error");

  revalidateInstagram();
  redirectWithToast("/admin/instagram", "Post added.");
}

export async function deleteInstagramPost(id: number) {
  await requireAdmin();
  const { error } = await getSupabaseAdmin().from("instagram_posts").delete().eq("id", id);
  if (error) redirectWithToast("/admin/instagram", error.message, "error");

  revalidateInstagram();
  redirectWithToast("/admin/instagram", "Post removed.");
}
