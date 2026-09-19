export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-canvas" />
      <div className="h-4 w-72 rounded-lg bg-canvas mt-3" />
      <div className="mt-8 border border-rule rounded-2xl overflow-hidden">
        <div className="h-10 bg-canvas" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-14 border-t border-rule bg-paper-tint" />
        ))}
      </div>
    </div>
  );
}
