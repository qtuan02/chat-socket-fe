import type { ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="absolute inset-0 z-0 flex min-h-svh flex-col items-center justify-center bg-linear-to-br from-primary/15 via-background to-background p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">{children}</div>
    </div>
  );
}
