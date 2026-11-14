"use client";

// Header checkbox: ticks/unticks every `id` checkbox in the same form.
export default function SelectAll() {
  return (
    <input
      type="checkbox"
      aria-label="Select all orders"
      onChange={(e) => {
        e.currentTarget.form
          ?.querySelectorAll<HTMLInputElement>('input[name="id"]')
          .forEach((c) => (c.checked = e.currentTarget.checked));
      }}
    />
  );
}
