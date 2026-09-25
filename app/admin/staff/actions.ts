"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { requireSection } from "@/lib/adminAuth";
import { SECTIONS, accessOf, isSection } from "@/lib/adminSections";
import { redirectWithToast } from "@/lib/actionRedirect";

// Staff role + sections live in Clerk publicMetadata, same place as the admin
// role - proxy.ts reads them on every /admin request.

function sectionsFrom(formData: FormData) {
  const sections = formData.getAll("sections").map(String).filter(isSection);
  if (sections.length === 0) redirectWithToast("/admin/staff", "Pick at least one section.", "error");
  return sections;
}

const describe = (sections: string[]) =>
  sections.map((s) => SECTIONS[s as keyof typeof SECTIONS]).join(", ");

export async function addStaff(formData: FormData) {
  const { log } = await requireSection("staff");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const sections = sectionsFrom(formData);

  const clerk = await clerkClient();
  const { data } = await clerk.users.getUserList({ emailAddress: [email] });
  const user = data.find((u) => u.emailAddresses.some((e) => e.emailAddress.toLowerCase() === email));
  if (!user) {
    redirectWithToast(
      "/admin/staff",
      "No account with that email - ask them to sign up on the store first.",
      "error"
    );
  }
  if (accessOf(user.publicMetadata)?.role === "admin") {
    redirectWithToast("/admin/staff", "That person is already an admin.", "error");
  }

  await clerk.users.updateUserMetadata(user.id, { publicMetadata: { role: "staff", sections } });

  await log(`Made ${email} staff with access to: ${describe(sections)}`);
  revalidatePath("/admin/staff");
  redirectWithToast("/admin/staff", `${email} added as staff.`);
}

export async function updateStaffSections(userId: string, email: string, formData: FormData) {
  const { log } = await requireSection("staff");
  const sections = sectionsFrom(formData);

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (accessOf(user.publicMetadata)?.role !== "staff") {
    redirectWithToast("/admin/staff", "That person isn't staff.", "error");
  }
  await clerk.users.updateUserMetadata(userId, { publicMetadata: { role: "staff", sections } });

  await log(`Changed ${email}'s access to: ${describe(sections)}`);
  revalidatePath("/admin/staff");
  redirectWithToast("/admin/staff", "Permissions saved.");
}

export async function removeStaff(userId: string, email: string) {
  const { log } = await requireSection("staff");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (accessOf(user.publicMetadata)?.role !== "staff") {
    redirectWithToast("/admin/staff", "That person isn't staff.", "error");
  }
  // null deletes the key - publicMetadata updates are merged, not replaced.
  await clerk.users.updateUserMetadata(userId, { publicMetadata: { role: null, sections: null } });

  await log(`Removed ${email} from staff`);
  revalidatePath("/admin/staff");
  redirectWithToast("/admin/staff", `${email} removed from staff.`);
}
