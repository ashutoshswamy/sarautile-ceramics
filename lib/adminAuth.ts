import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { accessOf, canAccess, type Section } from "@/lib/adminSections";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Admin role lives in Clerk's publicMetadata: { role: "admin" }, set by hand
// in the Clerk dashboard (Users -> pick a user -> edit "Public metadata").
// There is no self-service way to grant it - that's deliberate. Staff
// ({ role: "staff", sections: [...] }) are granted by an admin at /admin/staff.
export async function getAdminAccess() {
  const user = await currentUser();
  if (!user) redirect("/signin");
  const access = accessOf(user.publicMetadata);
  if (!access) notFound();
  const label = user.fullName ?? user.primaryEmailAddress?.emailAddress ?? user.id;
  return { user, access, label };
}

// Guard for every admin server action - re-checked here, never trust that
// the page render alone guarded it (actions are callable from any URL).
// Returns a logger that records the action in staff_logs under this section.
export async function requireSection(section: Section) {
  const { user, access, label } = await getAdminAccess();
  if (!canAccess(access, section)) notFound();

  return {
    label,
    log: async (action: string) => {
      const { error } = await getSupabaseAdmin().from("staff_logs").insert({
        actor_id: user.id,
        actor_name: label,
        actor_role: access.role,
        section,
        action,
      });
      // ponytail: a failed log line shouldn't undo a change that already saved.
      if (error) console.error("staff_logs insert failed:", error);
    },
  };
}
