const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export default function TypedHeadline({
  text,
  progress,
  start = 0,
  end = 0.55,
  className,
}: {
  text: string;
  progress: number;
  start?: number;
  end?: number;
  className?: string;
}) {
  const t = clamp01((progress - start) / (end - start));
  const count = Math.round(text.length * t);
  const typed = text.slice(0, count);
  const done = count >= text.length;

  return (
    <h1 className={className}>
      {typed}
      {count > 0 && !done && (
        <span className="inline-block w-[3px] h-[0.85em] bg-ink ml-1 align-middle animate-pulse" />
      )}
    </h1>
  );
}
