import { Virtuoso } from "react-virtuoso";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FriendSearchTrigger } from "@/features/friend-search/components/friend-search-trigger";
import type { Conversation, ConversationTypeEnum } from "@/types/conversation";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/error";
import { ConversationListFilter } from "./conversation-list-filter";
import { ConversationListItem } from "./conversation-list-item";
import { ConversationListSkeleton } from "./conversation-list-skeleton";

type ConversationListProps = {
  className?: string;
  activeConversationId: string;
  activeFilter: ConversationTypeEnum | null;
  conversations: Conversation[];
  error: unknown;
  isError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  onConversationSelect: (conversationId: string) => void;
  onFilterChange: (nextFilter: ConversationTypeEnum | null) => void;
  onFriendSearchOpen: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
};

function ConversationListError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
      <p className="m-0 mb-2 text-destructive">
        {getErrorMessage(error, "Unable to load conversations.")}
      </p>
      <Button type="button" size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export function ConversationList({
  className,
  activeConversationId,
  activeFilter,
  conversations,
  error,
  isError,
  isFetchingNextPage,
  isLoading,
  onConversationSelect,
  onFilterChange,
  onFriendSearchOpen,
  onLoadMore,
  onRetry,
}: ConversationListProps) {
  return (
    <section className={cn("flex flex-col bg-background/60", className)}>
      <div className="px-3 pt-3 md:px-4 md:pt-4">
        <FriendSearchTrigger onOpen={onFriendSearchOpen} />

        <ConversationListFilter
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-3 md:p-4">
        {isLoading ? <ConversationListSkeleton /> : null}

        {isError ? (
          <ConversationListError error={error} onRetry={onRetry} />
        ) : null}

        {conversations.length === 0 && !isLoading && !isError ? (
          <p className="m-0 text-sm text-muted-foreground">
            No conversations to show.
          </p>
        ) : null}

        {conversations.length > 0 && !isLoading && !isError ? (
          <Virtuoso
            data={conversations}
            endReached={onLoadMore}
            itemContent={(_, conversation) => (
              <ConversationListItem
                key={conversation.id}
                activeConversationId={activeConversationId}
                conversation={conversation}
                onSelectConversation={onConversationSelect}
              />
            )}
            components={{
              Footer: () =>
                isFetchingNextPage ? (
                  <div className="px-1 pb-2 pt-3">
                    <Skeleton className="mx-auto h-3 w-32 rounded-full" />
                  </div>
                ) : null,
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
