import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-x flex flex-col items-center text-center py-20 sm:py-28">
      <Image
        src="/404.png"
        alt=""
        width={220}
        height={220}
        priority
        className="w-40 sm:w-52 h-auto"
      />
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
