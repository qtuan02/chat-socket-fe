import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

type CurrentUserSkeletonProps = {
  className?: string;
};

type CurrentUserErrorProps = {
  className?: string;
  errorMessage: string;
  isRetrying: boolean;
  onRetry: () => void;
};

export function CurrentUserSkeleton({ className }: CurrentUserSkeletonProps) {
  return (
    <section className={cn("w-full p-4", className)}>
      <div className="inline-flex w-full items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-left">
        <div className="flex min-w-0 items-center gap-2.5">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
        </div>
        <Skeleton className="size-4 rounded-md" />
      </div>
    </section>
  );
}

export function CurrentUserError({
  className,
  errorMessage,
  isRetrying,
  onRetry,
}: CurrentUserErrorProps) {
  return (
    <section className={cn("w-full p-4", className)}>
      <div className="rounded-xl bg-destructive/5 px-3 py-2.5 text-xs">
        <p className="mb-2 text-destructive">{errorMessage}</p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? "Retrying..." : "Retry"}
        </Button>
      </div>
    </section>
  );
}
