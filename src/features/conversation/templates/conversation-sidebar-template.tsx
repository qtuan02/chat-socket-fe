import { ConversationList } from "@/features/conversation/components/conversation-list";
import { ConversationSidebarHeader } from "@/features/conversation/components/conversation-sidebar-header";
import type { Conversation } from "@/types/conversation";
import type { ConversationTypeEnum } from "@/types/conversation";
import { cn } from "@/utils/cn";

type ConversationSidebarTemplateProps = {
  activeConversationId: string;
  className?: string;
  conversationFilter: ConversationTypeEnum | null;
  conversations: Conversation[];
  error: Error | null;
  isError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  onConversationFilterChange: (filter: ConversationTypeEnum | null) => void;
  onConversationSelect: (conversationId: string) => void;
  onCreateGroupClick: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
  onUserSearchOpen: () => void;
};

export function ConversationSidebarTemplate({
  activeConversationId,
  className,
  conversationFilter,
  conversations,
  error,
  isError,
  isFetchingNextPage,
  isLoading,
  onConversationFilterChange,
  onConversationSelect,
  onCreateGroupClick,
  onLoadMore,
  onRetry,
  onUserSearchOpen,
}: ConversationSidebarTemplateProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <ConversationSidebarHeader onCreateGroupClick={onCreateGroupClick} />
      <ConversationList
        activeConversationId={activeConversationId}
        activeFilter={conversationFilter}
        className="min-h-0 flex-1 overflow-hidden"
        conversations={conversations}
        error={error}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        onConversationSelect={onConversationSelect}
        onFilterChange={onConversationFilterChange}
        onUserSearchOpen={onUserSearchOpen}
        onLoadMore={onLoadMore}
        onRetry={onRetry}
      />
    </div>
  );
}
