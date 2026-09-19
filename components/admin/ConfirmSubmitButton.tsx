"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";

// Renders inside a <form action={...}>. Clicking opens a native <dialog>
// confirm instead of submitting; the dialog's own submit button (type="submit",
// no form nesting trickery needed - it's a normal descendant of the form)
// is what actually fires the action.
export default function ConfirmSubmitButton({
  children,
  confirmTitle,
  confirmBody,
  confirmLabel = "Delete",
  pendingLabel = "Working…",
  className,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  confirmTitle: string;
  confirmBody?: string;
  confirmLabel?: string;
  pendingLabel?: string;
  className?: string;
  "aria-label"?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-label={ariaLabel}
        onClick={() => dialogRef.current?.showModal()}
        className={className}
      >
        {pending ? pendingLabel : children}
      </button>
      <dialog ref={dialogRef} className="confirm-dialog">
        <p className="font-medium text-ink">{confirmTitle}</p>
        {confirmBody && <p className="text-sm text-ink-soft mt-1.5">{confirmBody}</p>}
        <div className="flex gap-2.5 justify-end mt-5">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="btn btn-ghost h-9 px-4 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={() => dialogRef.current?.close()}
            className="btn h-9 px-4 text-sm bg-warn-ink text-paper hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
