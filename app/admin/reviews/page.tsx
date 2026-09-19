import { Star, Trash2, Check } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { approveReview, deleteReview } from "./actions";

type ReviewRow = {
  id: number;
  product_slug: string;
  customer_name: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={1.8}
          className={i < rating ? "fill-terracotta text-terracotta" : "text-ink-faint"}
        />
      ))}
    </span>
  );
}

export default async function AdminReviewsPage(props: PageProps<"/admin/reviews">) {
  const searchParams = await props.searchParams;
  const filter = searchParams.filter === "approved" ? "approved" : "pending";

  const { data } = await getSupabaseAdmin()
    .from("reviews")
    .select("id, product_slug, customer_name, rating, comment, approved, created_at")
    .order("created_at", { ascending: false })
    .returns<ReviewRow[]>();

  const reviews = (data ?? []).filter((r) => (filter === "approved" ? r.approved : !r.approved));
  const pendingCount = (data ?? []).filter((r) => !r.approved).length;
  const returnPath = `/admin/reviews?filter=${filter}`;

  return (
    <div className="max-w-[640px]">
      <h1 className="display-2">Reviews</h1>
      <p className="lede text-[0.95rem] mt-2">
        {pendingCount} waiting for approval before they show on the product page.
      </p>

      <div className="flex gap-2 mt-6">
        <a
          href="/admin/reviews?filter=pending"
          className={`px-3 py-1.5 rounded-full border text-xs no-underline transition-colors ${
            filter === "pending" ? "border-ink bg-ink text-paper" : "border-rule text-ink-soft"
          }`}
        >
          Pending
        </a>
        <a
          href="/admin/reviews?filter=approved"
          className={`px-3 py-1.5 rounded-full border text-xs no-underline transition-colors ${
            filter === "approved" ? "border-ink bg-ink text-paper" : "border-rule text-ink-soft"
          }`}
        >
          Approved
        </a>
      </div>

      <div className="flex flex-col mt-6">
        {reviews.map((r) => (
          <div key={r.id} className="py-4 border-b border-rule">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Stars rating={r.rating} />
              <span className="text-sm font-medium text-ink">{r.customer_name}</span>
              <span className="text-xs text-ink-faint">on {r.product_slug}</span>
              <span className="text-xs text-ink-faint ml-auto">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">{r.comment}</p>
            <div className="flex gap-3 mt-2.5">
              {!r.approved && (
                <form action={approveReview.bind(null, r.id, r.product_slug, returnPath)}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 text-xs text-sage-ink cursor-pointer hover:underline"
                  >
                    <Check size={13} strokeWidth={2} aria-hidden />
                    Approve
                  </button>
                </form>
              )}
              <form action={deleteReview.bind(null, r.id, r.product_slug, returnPath)}>
                <ConfirmSubmitButton
                  confirmTitle="Delete this review?"
                  className="inline-flex items-center gap-1.5 text-xs text-ink-faint cursor-pointer hover:text-warn-ink disabled:opacity-60"
                >
                  <Trash2 size={13} strokeWidth={1.8} aria-hidden />
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-ink-faint py-3">Nothing here.</p>
        )}
      </div>
    </div>
  );
}
