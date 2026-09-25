import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { SECTIONS } from "@/lib/adminSections";

const PAGE_SIZE = 100;

type LogRow = {
  id: number;
  actor_name: string;
  actor_role: string;
  section: string;
  action: string;
  created_at: string;
};

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; page?: string }>;
}) {
  const { role, page } = await searchParams;
  const pageNum = Math.max(1, Math.trunc(Number(page)) || 1);
  const from = (pageNum - 1) * PAGE_SIZE;

  let query = getSupabaseAdmin()
    .from("staff_logs")
    .select("id, actor_name, actor_role, section, action, created_at")
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE); // one extra row tells us there's a next page
  if (role === "staff" || role === "admin") query = query.eq("actor_role", role);
  const { data } = await query.returns<LogRow[]>();

  const rows = (data ?? []).slice(0, PAGE_SIZE);
  const hasNext = (data ?? []).length > PAGE_SIZE;
  const href = (p: number, r = role) =>
    `/admin/activity?${new URLSearchParams({ ...(r ? { role: r } : {}), ...(p > 1 ? { page: String(p) } : {}) })}`;

  const FILTERS = [
    { label: "Everyone", value: undefined },
    { label: "Staff", value: "staff" },
    { label: "Admins", value: "admin" },
  ];

  return (
    <div>
      <h1 className="display-2">Staff activity</h1>
      <p className="lede text-[0.95rem] mt-2">Who changed what in the admin panel, and when.</p>

      <div className="flex gap-2 mt-8">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={href(1, f.value)}
            className={`badge no-underline ${role === f.value ? "bg-ink text-paper" : "bg-canvas text-ink-soft"}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-ink-faint mt-6">No activity recorded yet.</p>
      ) : (
        <div className="border border-rule rounded-2xl overflow-x-auto mt-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Who</th>
                <th className="px-4 py-3 font-medium">Section</th>
                <th className="px-4 py-3 font-medium">What</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-rule align-top">
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-ink">{r.actor_name}</span>{" "}
                    <span className="badge bg-canvas text-ink-faint">{r.actor_role}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                    {SECTIONS[r.section as keyof typeof SECTIONS] ?? "Staff"}
                  </td>
                  <td className="px-4 py-3 text-ink">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(pageNum > 1 || hasNext) && (
        <div className="flex gap-4 mt-5 text-sm">
          {pageNum > 1 && <Link href={href(pageNum - 1)}>← Newer</Link>}
          {hasNext && <Link href={href(pageNum + 1)}>Older →</Link>}
        </div>
      )}
    </div>
  );
}
