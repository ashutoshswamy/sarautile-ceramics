"use server";

import { currentUser } from "@clerk/nextjs/server";
import { cancelOrder } from "@/lib/orderCancel";

export async function cancelMyOrder(id: number) {
  const user = await currentUser();
  if (!user) return { ok: false, message: "Sign in first." };
  try {
    await cancelOrder(id, user.id);
    return { ok: true, message: "Order cancelled - your refund is on its way." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Couldn't cancel the order." };
  }
}
