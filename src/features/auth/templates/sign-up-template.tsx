import type { HTMLAttributes } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { SignUpForm } from "../components/sign-up-form";

type SignUpTemplateProps = HTMLAttributes<HTMLDivElement>;

export function SignUpTemplate({ className, ...props }: SignUpTemplateProps) {
  return (
    <main className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden rounded-2xl p-0 shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[70dvh]">
          <SignUpForm />
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
