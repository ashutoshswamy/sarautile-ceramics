"use client";

import { useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import Reveal from "@/components/Reveal";
import { gsap } from "@/lib/gsap";

const QUANTITY_RANGES = ["24-48", "48-100", "100+"];

export default function WholesaleForm() {
  const [quantityRange, setQuantityRange] = useState(QUANTITY_RANGES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const rangeBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function hoverIn(range: string, i: number) {
    if (range === quantityRange) return;
    gsap.to(rangeBtnRefs.current[i], { backgroundColor: "var(--canvas)", duration: 0.2 });
  }
  function hoverOut(range: string, i: number) {
    if (range === quantityRange) return;
    gsap.to(rangeBtnRefs.current[i], { backgroundColor: "transparent", duration: 0.2 });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const { error } = await getSupabase().from("wholesale_inquiries").insert({
      business_name: data.get("business_name"),
      contact_name: data.get("contact_name"),
      email: data.get("email"),
      quantity_range: quantityRange,
      message: (data.get("message") as string) || null,
    });
    setSubmitting(false);
    if (error) {
      setError("Couldn't send that - try again in a moment.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Reveal className="card bg-sand border-transparent p-6 sm:p-7">
        <h2 className="display-3">Sent</h2>
        <p className="text-sm text-ink-soft mt-2.5">
          Meera answers these, usually within a week.
        </p>
      </Reveal>
    );
  }

  return (
    <Reveal as="form" onSubmit={handleSubmit} className="card bg-sand border-transparent p-6 sm:p-7">
      <h2 className="display-3">Tell us about the place</h2>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5 mt-5">
        <label className="field-label col-span-2">
          Business name
          <input name="business_name" required className="field" />
        </label>
        <label className="field-label">
          Your name
          <input name="contact_name" required className="field" />
        </label>
        <label className="field-label">
          Email
          <input name="email" type="email" required className="field" />
        </label>
        <label className="field-label col-span-2">
          Roughly how many pieces?
          <span className="flex border border-rule-strong rounded-full overflow-hidden bg-paper-tint text-sm">
            {QUANTITY_RANGES.map((range, i) => (
              <button
                key={range}
                ref={(el) => {
                  rangeBtnRefs.current[i] = el;
                }}
                type="button"
                onClick={() => setQuantityRange(range)}
                onMouseEnter={() => hoverIn(range, i)}
                onMouseLeave={() => hoverOut(range, i)}
                aria-pressed={quantityRange === range}
                className={`flex-1 text-center py-2.5 cursor-pointer ${
                  quantityRange === range ? "bg-ink text-paper" : ""
                }`}
              >
                {range}
              </button>
            ))}
          </span>
        </label>
        <label className="field-label col-span-2">
          Anything else
          <textarea
            name="message"
            placeholder="We're a two-room café in Mumbai, walls are dark green…"
            className="field"
          />
        </label>
      </div>
      {error && <p className="text-sm text-warn-ink mt-3">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary btn-block mt-5 disabled:opacity-60"
      >
        <Send size={15} strokeWidth={1.8} aria-hidden />
        {submitting ? "Sending…" : "Send it over"}
      </button>
      <p className="text-xs text-ink-soft mt-3 text-center">
        Meera answers these, usually within a week.
      </p>
    </Reveal>
  );
}
