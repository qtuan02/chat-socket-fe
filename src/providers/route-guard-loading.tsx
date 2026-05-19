import { Loader2 } from "lucide-react";

export function RouteGuardLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>Checking session...</span>
      </div>
    </div>
  );
}
