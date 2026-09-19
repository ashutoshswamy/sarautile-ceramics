import { redirect } from "next/navigation";

// Post/redirect/get for every admin mutation: land back on a fresh GET with
// ?toast=... in the URL, which <ToastFromQuery> (mounted once in the root
// layout) picks up, shows, and strips. Keeps every "saved" / "deleted" /
// "failed" confirmation on one code path instead of each form reinventing it.
export function toastUrl(path: string, message: string, type: "success" | "error" = "success") {
  const params = new URLSearchParams({ toast: message });
  if (type === "error") params.set("toastType", "error");
  return `${path}?${params.toString()}`;
}

export function redirectWithToast(
  path: string,
  message: string,
  type: "success" | "error" = "success"
): never {
  redirect(toastUrl(path, message, type));
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}
