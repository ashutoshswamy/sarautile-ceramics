"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
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
    <div className="max-w-md mx-auto px-6 py-32 text-center">
      <h1 className="display-2">Something went wrong</h1>
      <p className="lede text-[0.95rem] mt-3">
        That page hit a snag. Try again, or head back home.
      </p>
      <div className="flex items-center justify-center gap-3 mt-7">
        <button type="button" onClick={retry} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-ghost">
          Go home
        </Link>
      </div>
    </div>
  );
}
