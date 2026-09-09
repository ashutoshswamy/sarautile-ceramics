import AuthScreen from "@/components/AuthScreen";

// One persistent AuthScreen across /signin and /signup — the route group's
// layout stays mounted while the child route swaps, so the form can animate
// the change instead of a full navigation.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthScreen />
      {children}
    </>
  );
}
