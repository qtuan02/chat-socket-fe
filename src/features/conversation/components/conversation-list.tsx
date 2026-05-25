import { Virtuoso } from "react-virtuoso";
import { Button } from "@/components/ui/button";
import type { Conversation, ConversationTypeEnum } from "@/types/conversation";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/error";
import { ConversationListFilter } from "./conversation-list-filter";
import { ConversationListItem } from "./conversation-list-item";
import { ConversationListLoadMoreFooter } from "./conversation-list-load-more-footer";
import { ConversationListSkeleton } from "./conversation-list-skeleton";
import { UserSearchTrigger } from "./user-search-trigger";

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
  onUserSearchOpen: () => void;
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

const conversationListVirtuosoComponents = {
  Footer: function ConversationListVirtuosoFooter() {
    return (
      <ConversationListLoadMoreFooter
        isFetchingNextPage={conversationListFooterState.isFetchingNextPage}
      />
    );
  },
};

const conversationListFooterState = {
  isFetchingNextPage: false,
};

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
  onUserSearchOpen,
  onLoadMore,
  onRetry,
}: ConversationListProps) {
  conversationListFooterState.isFetchingNextPage = isFetchingNextPage;

  return (
    <section className={cn("flex flex-col bg-background/60", className)}>
      <div className="px-3 pt-3 md:px-4 md:pt-4">
        <UserSearchTrigger onOpen={onUserSearchOpen} />

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
            components={conversationListVirtuosoComponents}
          />
        ) : null}
      </div>
    </section>
  );
}
