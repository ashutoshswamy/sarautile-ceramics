export default function RootLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center py-32"
    >
      <span
        aria-hidden
        className="h-8 w-8 rounded-full border-2 border-rule border-t-terracotta animate-spin"
      />
    </div>
  );
}
