"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { useAuthedSupabase } from "@/lib/useAuthedSupabase";
import type { Review } from "@/lib/queries";

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

export default function ProductReviews({
  productSlug,
  initialReviews,
}: {
  productSlug: string;
  initialReviews: Review[];
}) {
  const { user } = useUser();
  const supabase = useAuthedSupabase();
  const reviews = initialReviews;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || rating < 1 || !comment.trim()) return;
    setSubmitting(true);
    setError("");
    const { error } = await supabase.from("reviews").insert({
      product_slug: productSlug,
      user_id: user.id,
      customer_name: user.firstName ?? user.fullName ?? "A customer",
      rating,
      comment: comment.trim(),
    });
    setSubmitting(false);
    if (error) {
      console.error("review submit failed:", error);
      setError("Couldn't submit that - try again in a moment.");
      return;
    }
    setDone(true);
    setComment("");
    setRating(0);
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
              <Stars rating={r.rating} />
              <span className="text-sm font-medium text-ink">{r.customerName}</span>
            </div>
            <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-ink-faint">No reviews yet - be the first.</p>
        )}
      </div>

      <div className="mt-8 max-w-[420px]">
        {!user ? (
          <p className="text-sm text-ink-faint">Sign in to leave a review.</p>
        ) : done ? (
          <p className="text-sm text-sage-ink">
            Thanks - your review is waiting on a quick approval before it shows here.
          </p>
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
