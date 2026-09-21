import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Video404 from "@/components/video-404";

export default function NotFound() {
  return (
    <section className="container-x flex flex-col items-center text-center py-20 sm:py-28">
      <Video404 />
      <span className="kicker mt-8">404</span>
      <h1 className="display-2 mt-3">This piece didn&apos;t make it out of the kiln.</h1>
      <p className="lede text-[0.95rem] mt-3 max-w-[36ch]">
        The page you're after broke somewhere between the wheel and here. Let's find you something whole.
      </p>
      <Link href="/products" className="btn btn-primary mt-7">
        Back to shop
        <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
      </Link>
    </section>
  );
}
