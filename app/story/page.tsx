import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { timeline } from "@/lib/data";
import Reveal from "@/components/Reveal";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Our story - Sara Utile Ceramics" };

export default function StoryPage() {
  return (
    <div className="container-x section-tight">
      <div className="max-w-[680px]">
        <span className="kicker">Since 2019</span>
        <h1 className="display-1 mt-4">
          An old godown in India, one secondhand wheel, and a kiln with
          opinions.
        </h1>
        <p className="lede mt-6">
          We didn&apos;t set out to sell mugs. Meera was making bowls, mostly
          badly, in a shed. Then a café in Udaipur asked for twenty mugs and
          we said yes before working out how long twenty mugs takes. Seven
          years later it&apos;s still just the two of us, still one shape at
          a time.
        </p>
      </div>

      <Reveal as="div" className="grid gap-5 md:grid-cols-[1.2fr_.8fr] mt-12">
        <PlaceholderPhoto
          label="the workshop, wide"
          rounded="rounded-[28px]"
          className="aspect-[16/10] p-3.5"
        />
        <PlaceholderPhoto
          label="Arjun, glaze bucket"
          rounded="rounded-[28px]"
          className="aspect-[4/5] p-3.5"
        />
      </Reveal>

      <Reveal as="div" className="mt-16 max-w-[760px]">
        <span className="kicker">The years</span>
        <div className="flex flex-col border-t border-rule mt-4">
          {timeline.map((t) => (
            <div
              key={t.year}
              className="grid grid-cols-[64px_1fr] sm:grid-cols-[92px_1fr] gap-5 sm:gap-6 py-6 border-b border-rule"
            >
              <span className="text-lg font-medium text-terracotta">
                {t.year}
              </span>
              <div>
                <h4 className="font-medium">{t.title}</h4>
                <p className="text-sm leading-relaxed text-ink-soft mt-1.5 max-w-[52ch]">
                  {t.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
