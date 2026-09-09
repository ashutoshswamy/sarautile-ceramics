import Image from "next/image";
import { pickMugImage } from "@/lib/mugImages";

export default function PlaceholderPhoto({
  label,
  className = "",
  rounded = "rounded-3xl",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: {
  label: string;
  className?: string;
  rounded?: string;
  /** kept for API compatibility with older callers */
  padding?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`ph-photo ${rounded} ${className}`}>
      <Image
        src={pickMugImage(label)}
        alt={label}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
