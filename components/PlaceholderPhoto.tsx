import Image from "next/image";
import { ImageOff } from "lucide-react";

export default function PlaceholderPhoto({
  label,
  src,
  className = "",
  rounded = "rounded-3xl",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: {
  label: string;
  /** Real uploaded photo. Falls back to a plain empty state when absent. */
  src?: string | null;
  className?: string;
  rounded?: string;
  /** kept for API compatibility with older callers */
  padding?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`ph-photo ${rounded} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={label}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="ph-photo__empty" title={label}>
          <ImageOff size={22} strokeWidth={1.5} aria-hidden />
        </div>
      )}
    </div>
  );
}
