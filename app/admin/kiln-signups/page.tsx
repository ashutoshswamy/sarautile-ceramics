import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type Signup = { email: string; created_at: string };

export default async function AdminKilnSignupsPage() {
  const { data: signups } = await getSupabaseAdmin()
    .from("kiln_signups")
    .select("email, created_at")
    .order("created_at", { ascending: false })
    .returns<Signup[]>();

  return (
    <div>
      <h1 className="display-2">Kiln signups</h1>
      <p className="lede text-[0.95rem] mt-2">
        {signups?.length ?? 0} people waiting to hear the kiln opened.
      </p>

      {!signups || signups.length === 0 ? (
        <p className="text-sm text-ink-faint mt-8">Nothing yet.</p>
      ) : (
        <div className="mt-8 border border-rule rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s) => (
                <tr key={s.email} className="border-t border-rule">
                  <td className="px-4 py-3 text-ink">{s.email}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
