import { getSiteSettings } from "@/lib/queries";
import { DEFAULT_HERO_IMAGE } from "@/lib/heroImage";

export default async function Hero() {
  const settings = await getSiteSettings();
  const mobile = settings.heroImageMobile || DEFAULT_HERO_IMAGE;
  const tablet = settings.heroImageTablet || DEFAULT_HERO_IMAGE;
  const desktop = settings.heroImageDesktop || DEFAULT_HERO_IMAGE;

  return (
    <section className="relative w-full h-[560px] sm:h-[640px] md:h-[700px] overflow-hidden">
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop} />
        <source media="(min-width: 640px)" srcSet={tablet} />
        <img
          src={mobile}
          alt="Sarautile ceramics"
          className="h-full w-full object-cover"
        />
      </picture>
    </section>
  );
}
