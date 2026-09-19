"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toaster";

// Server actions redirect back with ?toast=...&toastType=error - this fires
// that as a toast once, then strips the params so a refresh/back doesn't
// replay it.
export default function ToastFromQuery() {
  const push = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("toast");

  useEffect(() => {
    if (!message) return;
    push(message, searchParams.get("toastType") === "error" ? "error" : "success");
    const params = new URLSearchParams(searchParams);
    params.delete("toast");
    params.delete("toastType");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return null;
}
