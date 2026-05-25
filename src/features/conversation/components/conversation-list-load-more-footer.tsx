import { Skeleton } from "@/components/ui/skeleton";

type ConversationListLoadMoreFooterProps = {
  isFetchingNextPage: boolean;
};

export function ConversationListLoadMoreFooter({
  isFetchingNextPage,
}: ConversationListLoadMoreFooterProps) {
  if (!isFetchingNextPage) return null;

  return (
    <div className="px-1 pb-2 pt-3">
      <Skeleton className="mx-auto h-3 w-32 rounded-full" />
    </div>
  );
}
