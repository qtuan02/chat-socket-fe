import { Skeleton } from "@/components/ui/skeleton";

export function WelcomeSkeleton() {
  return (
    <section className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-lg border border-border/70 bg-background p-5 shadow-sm md:p-6">
        <div className="grid gap-4 rounded-md border border-muted/80 bg-muted/30 p-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-center md:gap-6">
          <Skeleton className="h-40 w-full rounded-md md:h-44" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-52 max-w-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
