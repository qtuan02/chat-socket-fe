import type { HTMLAttributes } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { SignInForm } from "../components/sign-in-form";

type SignInTemplateProps = HTMLAttributes<HTMLDivElement>;

export function SignInTemplate({ className, ...props }: SignInTemplateProps) {
  return (
    <main className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[70dvh]">
          <SignInForm />
          <div className="relative hidden bg-muted md:block">
            <img
              src="/banner-login.jpg"
              alt="banner-login"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
