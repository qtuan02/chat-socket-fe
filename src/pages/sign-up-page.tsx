import { SignUpTemplate } from "@/features/auth/templates/sign-up-template";
import { AuthPageShell } from "@/pages/auth-page-shell";

export function SignUpPage() {
  return (
    <AuthPageShell>
      <SignUpTemplate />
    </AuthPageShell>
  );
}
