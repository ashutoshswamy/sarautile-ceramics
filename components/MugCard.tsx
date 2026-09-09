import Link from "next/link";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import type { Mug } from "@/lib/data";

export default function MugCard({
  mug,
  showLeft = false,
}: {
  mug: Mug;
  showLeft?: boolean;
}) {
  return (
    <Link href={`/mugs/${mug.slug}`} className="mug-card group">
      <div className="mug-card__media">
        <PlaceholderPhoto
          label={mug.photoLabel}
          rounded="rounded-none"
          className="aspect-square"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-ink transition-colors group-hover:text-terracotta-hover">
            {mug.name}
          </span>
          {showLeft && (
            <span className="ml-auto rounded-full bg-warn-bg px-2 py-0.5 text-[11px] font-medium text-warn-ink">
              {mug.left}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 text-sm text-ink-soft">
          <span>{mug.note}</span>
          <span className="ml-auto font-medium text-ink">₹{mug.price}</span>
        </div>
      </div>
    </Link>
  );
}
