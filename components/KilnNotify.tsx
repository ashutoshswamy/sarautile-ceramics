"use client";

import { useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";

export default function KilnNotify() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const email = new FormData(e.currentTarget).get("email") as string;
    const { error } = await getSupabase().from("kiln_signups").insert({ email });
    if (error) {
      // unique violation = already on the list, treat as success
      if (error.code === "23505") setSent(true);
      else setError("Couldn't save that - try again in a moment.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-[0.95rem] text-paper/80">
        You&apos;re on the list - we&apos;ll text you when kiln 42 opens.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 max-w-md">
      <input
        name="email"
        type="email"
        required
        placeholder="you@email.com"
        className="field flex-1 min-w-[200px]"
        aria-label="Email address"
      />
      <button type="submit" className="btn btn-primary shrink-0">
        Notify me
      </button>
      {error && <p className="text-sm text-terracotta-light w-full">{error}</p>}
    </form>
  );
}
