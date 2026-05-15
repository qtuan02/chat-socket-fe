import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

const messageSkeletonItems = [
  { id: "message-skeleton-1", isOwnMessage: false, width: "w-44" },
  { id: "message-skeleton-2", isOwnMessage: true, width: "w-52" },
  { id: "message-skeleton-3", isOwnMessage: false, width: "w-28" },
  { id: "message-skeleton-4", isOwnMessage: true, width: "w-36" },
  { id: "message-skeleton-5", isOwnMessage: false, width: "w-60" },
  { id: "message-skeleton-6", isOwnMessage: false, width: "w-24" },
  { id: "message-skeleton-7", isOwnMessage: true, width: "w-44" },
] as const;

type MessageListSkeletonProps = {
  className?: string;
};

export function MessageListSkeleton({ className }: MessageListSkeletonProps) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-1 flex-col justify-end overflow-hidden p-4",
        className,
      )}
    >
      <div className="space-y-2">
        {messageSkeletonItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex pb-1",
              item.isOwnMessage ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "flex max-w-[75%] flex-col gap-1.5",
                item.isOwnMessage ? "items-end" : "items-start",
              )}
            >
              {item.isOwnMessage ? null : <Skeleton className="h-3 w-16" />}
              <Skeleton className={cn("h-9 rounded-lg", item.width)} />
              <Skeleton className="h-2.5 w-10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
