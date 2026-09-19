"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS, type SortValue } from "@/lib/sort";

export default function SortSelect({ value }: { value: SortValue }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "newest") params.delete("sort");
    else params.set("sort", e.target.value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      aria-label="Sort"
      className="bg-transparent text-sm text-ink-soft cursor-pointer focus:outline-none"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
