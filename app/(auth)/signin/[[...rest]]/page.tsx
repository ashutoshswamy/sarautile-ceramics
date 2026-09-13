import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in — Sarautile Ceramics" };

export default function SignInPage() {
  return (
    <SignIn
      path="/signin"
      routing="path"
      signUpUrl="/signup"
      forceRedirectUrl="/wishlist"
    />
  );
}
