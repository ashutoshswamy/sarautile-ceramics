import { getSiteSettings, SiteSettings } from "@/lib/queries";

const BREAKPOINTS: {
  src: keyof SiteSettings;
  position: keyof SiteSettings;
  className: string;
}[] = [
  { src: "heroImageMobile", position: "heroImageMobilePosition", className: "sm:hidden" },
  {
    src: "heroImageTablet",
    position: "heroImageTabletPosition",
    className: "hidden sm:block md:hidden",
  },
  { src: "heroImageDesktop", position: "heroImageDesktopPosition", className: "hidden md:block" },
];

export default async function Hero() {
  const settings = await getSiteSettings();
  // No stock fallback - an unset breakpoint borrows whichever breakpoint the
  // admin did set, and the section is blank until at least one is set.
  const base = BREAKPOINTS.map((b) => ({
    src: settings[b.src] as string | null,
    position: settings[b.position] as string,
  })).find((b) => b.src);

  return (
    <section className="relative w-full h-[560px] sm:h-[640px] md:h-[700px] overflow-hidden">
      {base &&
        BREAKPOINTS.map(({ src, position, className }) => {
          const imgSrc = (settings[src] as string | null) || base.src!;
          const imgPosition = settings[src] ? (settings[position] as string) : base.position;
          return (
            <img
              key={src}
              src={imgSrc}
              alt="Sarautile ceramics"
              className={`absolute inset-0 h-full w-full object-cover ${className}`}
              style={{ objectPosition: imgPosition }}
            />
          );
        })}
    </section>
  );
}
