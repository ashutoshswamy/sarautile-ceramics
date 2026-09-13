import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { getSiteSettings } from "@/lib/queries";

export default async function Hero() {
  const settings = await getSiteSettings();

  return (
    <section className="relative w-full h-[560px] sm:h-[640px] md:h-[700px] overflow-hidden">
      <PlaceholderPhoto
        label={settings.heroPhotoLabel}
        rounded="rounded-none"
        className="h-full w-full"
        sizes="100vw"
        priority
      />
    </section>
  );
}
