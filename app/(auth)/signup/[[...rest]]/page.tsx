import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign up — Sarautile Ceramics" };

export default function SignUpPage() {
  return (
    <SignUp
      path="/signup"
      routing="path"
      signInUrl="/signin"
      forceRedirectUrl="/wishlist"
    />
  );
}
