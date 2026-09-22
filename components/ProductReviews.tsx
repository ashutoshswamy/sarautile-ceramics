"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Star, Trash2 } from "lucide-react";
import { useAuthedSupabase } from "@/lib/useAuthedSupabase";
import type { Review } from "@/lib/queries";

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- reviewer avatars come from Clerk's CDN, not next/image's configured remotePatterns
      <img src={url} alt="" className="size-6 rounded-full object-cover" />
    );
  }
  return (
    <span className="size-6 rounded-full bg-sand text-ink-faint text-[0.65rem] font-medium inline-flex items-center justify-center">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function Stars({ rating, onPick }: { rating: number; onPick?: (n: number) => void }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(i + 1)}
          className={onPick ? "cursor-pointer" : ""}
          aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
        >
          <Star
            size={onPick ? 20 : 14}
            strokeWidth={1.8}
            className={i < rating ? "fill-terracotta text-terracotta" : "text-ink-faint"}
          />
        </button>
      ))}
    </span>
  );
}

type MyReview = {
  id: number;
  rating: number;
  comment: string;
  approved: boolean;
  adminReply: string | null;
};

export default function ProductReviews({
  productSlug,
  initialReviews,
}: {
  productSlug: string;
  initialReviews: Review[];
}) {
  const { user, isLoaded } = useUser();
  const supabase = useAuthedSupabase();
  const reviews = initialReviews;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mine, setMine] = useState<MyReview | null>(null);
  const [deleting, setDeleting] = useState(false);

  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  useEffect(() => {
    if (!isLoaded || !user) return;
    let cancelled = false;
    supabase
      .from("reviews")
      .select("id, rating, comment, approved, admin_reply")
      .eq("product_slug", productSlug)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setMine({
          id: data.id,
          rating: data.rating,
          comment: data.comment,
          approved: data.approved,
          adminReply: data.admin_reply,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, user, supabase, productSlug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || rating < 1 || !comment.trim()) return;
    setSubmitting(true);
    setError("");
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_slug: productSlug,
        user_id: user.id,
        customer_name: user.firstName ?? user.fullName ?? "A customer",
        avatar_url: user.imageUrl ?? null,
        rating,
        comment: comment.trim(),
      })
      .select("id, rating, comment, approved, admin_reply")
      .single();
    setSubmitting(false);
    if (error) {
      console.error("review submit failed:", error);
      setError("Couldn't submit that - try again in a moment.");
      return;
    }
    setMine({
      id: data.id,
      rating: data.rating,
      comment: data.comment,
      approved: data.approved,
      adminReply: data.admin_reply,
    });
    setComment("");
    setRating(0);
  }

  async function handleDelete() {
    if (!mine) return;
    setDeleting(true);
    const { error } = await supabase.from("reviews").delete().eq("id", mine.id);
    setDeleting(false);
    if (error) {
      console.error("review delete failed:", error);
      setError("Couldn't delete that - try again in a moment.");
      return;
    }
    setMine(null);
  }

  return (
    <div className="border-t border-rule pt-10 mt-10">
      <div className="flex items-center gap-3">
        <h2 className="display-3 text-[1.25rem]">Reviews</h2>
        {reviews.length > 0 && (
          <span className="text-sm text-ink-soft inline-flex items-center gap-1.5">
            <Stars rating={Math.round(avg)} />
            {avg.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5 mt-6">
        {reviews.map((r) => (
          <div key={r.id}>
            <div className="flex items-center gap-2.5">
              <Avatar url={r.avatarUrl} name={r.customerName} />
              <Stars rating={r.rating} />
              <span className="text-sm font-medium text-ink">{r.customerName}</span>
            </div>
            <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{r.comment}</p>
            {r.adminReply && (
              <div className="mt-2 ml-4 pl-3 border-l-2 border-rule">
                <p className="text-xs font-medium text-ink">Sarautile Ceramics</p>
                <p className="text-sm text-ink-soft mt-0.5 leading-relaxed">{r.adminReply}</p>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-ink-faint">No reviews yet - be the first.</p>
        )}
      </div>

      <div className="mt-8 max-w-[420px]">
        {!isLoaded ? null : !user ? (
          <p className="text-sm text-ink-faint">Sign in to leave a review.</p>
        ) : mine ? (
          <div>
            <div className="flex items-center gap-2.5">
              <Stars rating={mine.rating} />
              <span className="text-sm font-medium text-ink">Your review</span>
              {!mine.approved && (
                <span className="text-xs text-ink-faint">waiting on approval</span>
              )}
            </div>
            <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{mine.comment}</p>
            {mine.adminReply && (
              <div className="mt-2 ml-4 pl-3 border-l-2 border-rule">
                <p className="text-xs font-medium text-ink">Sarautile Ceramics</p>
                <p className="text-sm text-ink-soft mt-0.5 leading-relaxed">{mine.adminReply}</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 text-xs text-ink-faint hover:text-warn-ink mt-2.5 cursor-pointer disabled:opacity-60"
            >
              <Trash2 size={13} strokeWidth={1.8} aria-hidden />
              {deleting ? "Deleting…" : "Delete review"}
            </button>
            {error && <p className="text-sm text-warn-ink mt-1.5">{error}</p>}
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <span className="field-label">
              Your rating
              <Stars rating={rating} onPick={setRating} />
            </span>
            <label className="field-label">
              Your review
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="How's it holding up?"
                className="field"
              />
            </label>
            <button
              type="submit"
              disabled={submitting || rating < 1 || !comment.trim()}
              className="btn btn-primary self-start disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
            {error && <p className="text-sm text-warn-ink">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
