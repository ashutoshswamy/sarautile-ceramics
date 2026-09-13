import AuthAside from "@/components/AuthAside";

// Shared split-screen chrome for /signin and /signup - the brand panel on the
// left, Clerk's own <SignIn>/<SignUp> (rendered by the child page) on the right.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-split grid lg:grid-cols-[1fr_1.1fr]">
      <AuthAside />
      <div className="flex items-center justify-center px-6 py-16 sm:px-10">
        {children}
      </div>
    </div>
  );
}
