import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

const conversationSkeletonItems = [
  { id: "conversation-skeleton-1", titleWidth: "w-24", previewWidth: "w-32" },
  { id: "conversation-skeleton-2", titleWidth: "w-36", previewWidth: "w-20" },
  { id: "conversation-skeleton-3", titleWidth: "w-28", previewWidth: "w-40" },
  { id: "conversation-skeleton-4", titleWidth: "w-32", previewWidth: "w-28" },
  { id: "conversation-skeleton-5", titleWidth: "w-20", previewWidth: "w-36" },
  { id: "conversation-skeleton-6", titleWidth: "w-36", previewWidth: "w-24" },
] as const;

export function ConversationListSkeleton() {
  return (
    <div className="space-y-1">
      {conversationSkeletonItems.map((item) => (
        <div key={item.id} className="rounded-xl p-2">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className={cn("h-4", item.titleWidth)} />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className={cn("h-3", item.previewWidth)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
