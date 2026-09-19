import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type Inquiry = {
  id: number;
  business_name: string;
  contact_name: string;
  email: string;
  quantity_range: string;
  message: string | null;
  created_at: string;
};

export default async function AdminWholesalePage() {
  const { data: inquiries } = await getSupabaseAdmin()
    .from("wholesale_inquiries")
    .select("id, business_name, contact_name, email, quantity_range, message, created_at")
    .order("created_at", { ascending: false })
    .returns<Inquiry[]>();

  return (
    <div>
      <h1 className="display-2">Wholesale inquiries</h1>
      <p className="lede text-[0.95rem] mt-2">
        {inquiries?.length ?? 0} sent from the wholesale page.
      </p>

      {!inquiries || inquiries.length === 0 ? (
        <p className="text-sm text-ink-faint mt-8">Nothing yet.</p>
      ) : (
        <div className="flex flex-col mt-8">
          {inquiries.map((inq) => (
            <div key={inq.id} className="py-4 border-b border-rule">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-sm font-medium text-ink">{inq.business_name}</span>
                <span className="badge">{inq.quantity_range} pieces</span>
                <span className="text-xs text-ink-faint ml-auto">
                  {new Date(inq.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-ink-faint mt-1">
                {inq.contact_name} ·{" "}
                <a href={`mailto:${inq.email}`} className="hover:text-ink">
                  {inq.email}
                </a>
              </p>
              {inq.message && (
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">{inq.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
