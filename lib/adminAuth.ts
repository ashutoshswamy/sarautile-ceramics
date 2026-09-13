import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

// Admin role lives in Clerk's publicMetadata: { role: "admin" }, set by hand
// in the Clerk dashboard (Users -> pick a user -> edit "Public metadata").
// There is no self-service way to grant it - that's deliberate.
export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/signin");
  if (user.publicMetadata?.role !== "admin") notFound();
  return user;
}
