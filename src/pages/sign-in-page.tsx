import { SignInTemplate } from "@/features/auth/templates/sign-in-template";
import { AuthPageShell } from "@/pages/auth-page-shell";

export function SignInPage() {
  return (
    <AuthPageShell>
      <SignInTemplate />
    </AuthPageShell>
  );
}
