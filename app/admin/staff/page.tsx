import { clerkClient } from "@clerk/nextjs/server";
import { Trash2 } from "lucide-react";
import { SECTIONS, accessOf } from "@/lib/adminSections";
import SubmitButton from "@/components/admin/SubmitButton";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { addStaff, removeStaff, updateStaffSections } from "./actions";

function SectionCheckboxes({ checked = [] }: { checked?: string[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
      {Object.entries(SECTIONS).map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="sections" value={key} defaultChecked={checked.includes(key)} />
          {label}
        </label>
      ))}
    </div>
  );
}

export default async function AdminStaffPage() {
  // ponytail: Clerk can't filter by metadata, so scan the first 500 users.
  // Page through getUserList if the store ever outgrows that.
  const { data: users } = await (await clerkClient()).users.getUserList({ limit: 500 });
  const staff = users.flatMap((u) => {
    const access = accessOf(u.publicMetadata);
    if (access?.role !== "staff") return [];
    const email = u.primaryEmailAddress?.emailAddress ?? u.id;
    return [{ id: u.id, name: u.fullName, email, sections: access.sections }];
  });

  return (
    <div className="max-w-[720px]">
      <h1 className="display-2">Staff</h1>
      <p className="lede text-[0.95rem] mt-2">
        Give someone access to parts of the admin panel. They need a store account first.
      </p>

      <form action={addStaff} className="card p-5 mt-8 flex flex-col gap-4">
        <label className="field-label">
          Email
          <input name="email" type="email" required placeholder="name@example.com" className="field" />
        </label>
        <fieldset>
          <legend className="text-xs text-ink-faint uppercase tracking-wide mb-2">Can manage</legend>
          <SectionCheckboxes />
        </fieldset>
        <div>
          <SubmitButton>Add staff</SubmitButton>
        </div>
      </form>

      <div className="flex flex-col gap-5 mt-10">
        {staff.map((s) => (
          <div key={s.id} className="card p-5">
            <div className="flex items-start gap-3">
              <div className="min-w-0">
                <p className="text-ink font-medium truncate">{s.name ?? s.email}</p>
                {s.name && <p className="text-xs text-ink-faint truncate">{s.email}</p>}
              </div>
              <form action={removeStaff.bind(null, s.id, s.email)} className="ml-auto">
                <ConfirmSubmitButton
                  confirmTitle={`Remove ${s.email} from staff?`}
                  confirmBody="They'll lose access to the admin panel immediately."
                  confirmLabel="Remove"
                  aria-label={`Remove ${s.email}`}
                  className="text-ink-faint cursor-pointer transition-colors hover:text-warn-ink disabled:opacity-60"
                >
                  <Trash2 size={15} strokeWidth={1.8} />
                </ConfirmSubmitButton>
              </form>
            </div>
            <form
              action={updateStaffSections.bind(null, s.id, s.email)}
              className="flex flex-col gap-4 mt-4"
            >
              <SectionCheckboxes checked={s.sections} />
              <div>
                <SubmitButton>Save permissions</SubmitButton>
              </div>
            </form>
          </div>
        ))}
        {staff.length === 0 && <p className="text-sm text-ink-faint">No staff yet.</p>}
      </div>
    </div>
  );
}
