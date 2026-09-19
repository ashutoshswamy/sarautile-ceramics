"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-md py-16 text-center mx-auto">
      <h1 className="display-2">Something went wrong</h1>
      <p className="lede text-[0.95rem] mt-3">{error.message || "That action failed."}</p>
      <div className="flex items-center justify-center gap-3 mt-7">
        <button type="button" onClick={retry} className="btn btn-primary">
          Try again
        </button>
        <Link href="/admin" className="btn btn-ghost">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
