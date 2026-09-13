import Link from "next/link";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";

const HEADLINE = "Mugs made slowly, on a wheel, by two people.";

export default function Hero() {
  return (
    <section className="relative w-full h-[560px] sm:h-[640px] md:h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <PlaceholderPhoto
            label="sarautile hero spread"
            rounded="rounded-none"
            className="h-full w-full"
            sizes="100vw"
            priority
          />
        </div>

        <div className="relative z-[1] h-full flex items-center justify-center px-4">
          <div className="hero-copy bg-paper/95 backdrop-blur-sm rounded-3xl shadow-[var(--shadow-card)] px-7 py-9 sm:px-12 sm:py-12 max-w-[640px] text-center">
            <span className="kicker">Kiln 41 · open now</span>
            <h1 className="display-1 mt-3">{HEADLINE}</h1>
            <p className="lede max-w-[38ch] mx-auto mt-4">
              Every one comes out a little different - that&apos;s not a
              defect, it&apos;s the whole point. Thrown in stoneware, glazed
              in five colours we mix ourselves, fired twice.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-7">
              <Link href="/mugs" className="btn btn-primary">
                Shop this firing
              </Link>
              <Link href="/story" className="btn btn-ghost">
                Meet the makers
              </Link>
            </div>
          </div>
        </div>
    </section>
  );
}
