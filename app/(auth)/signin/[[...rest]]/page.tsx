import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Sara Utile Ceramics",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <SignIn
      path="/signin"
      routing="path"
      signUpUrl="/signup"
      fallbackRedirectUrl="/products"
    />
  );
}
