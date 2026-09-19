"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export async function updateOrderStatus(id: number, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;

  const { error } = await getSupabaseAdmin().from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
