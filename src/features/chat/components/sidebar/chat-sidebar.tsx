import { useChatSidebar } from "@/features/chat/hooks/use-chat-sidebar";
import { ConversationList } from "@/features/conversation/components/conversation-list";
import { ConversationSidebarHeader } from "@/features/conversation/components/conversation-sidebar-header";
import { CurrentUserSidebarSection } from "@/features/current-user/templates/current-user-sidebar-section";
import { CreateGroupDialogContainer } from "@/features/group/templates/create-group-dialog-container";
import type { DirectMessageUser } from "@/types/user";
import { cn } from "@/utils/cn";
import { UserSearchList } from "./user-search-list";

type ChatSidebarProps = {
  className?: string;
  activeConversationId: string;
  onConversationSelect?: () => void;
  onDirectMessageDraftSelect?: (user: DirectMessageUser) => void;
};

export function ChatSidebar({
  className,
  activeConversationId,
  onConversationSelect,
  onDirectMessageDraftSelect,
}: ChatSidebarProps) {
  const {
    activeView,
    conversationFilter,
    conversations,
    createGroupMutation,
    directConversationIdByUserId,
    error,
    handleCreateGroup,
    handleLoadMoreConversations,
    handleOpenCreateGroup,
    handleOpenUserSearch,
    handleRetryConversations,
    handleSelectConversation,
    handleSelectUser,
    handleShowConversations,
    isCreateGroupOpen,
    isError,
    isFetchingNextPage,
    isLoading,
    setConversationFilter,
    setIsCreateGroupOpen,
  } = useChatSidebar({
    activeConversationId,
    onConversationSelect,
    onDirectMessageDraftSelect,
  });

  return (
    <aside
      className={cn(
        "flex min-h-0 w-full flex-col border-border bg-background",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <ConversationSidebarHeader onCreateGroupClick={handleOpenCreateGroup} />

        {activeView === "user-search" ? (
          <div className="min-h-0 flex-1 p-3 md:p-4">
            <UserSearchList
              conversationIdByUserId={directConversationIdByUserId}
              onBack={handleShowConversations}
              onSelectUser={handleSelectUser}
            />
          </div>
        ) : null}

        {activeView === "conversations" ? (
          <ConversationList
            activeConversationId={activeConversationId}
            activeFilter={conversationFilter}
            className="min-h-0 flex-1 overflow-hidden"
            conversations={conversations}
            error={error}
            isError={isError}
            isFetchingNextPage={isFetchingNextPage}
            isLoading={isLoading}
            onConversationSelect={handleSelectConversation}
            onFilterChange={setConversationFilter}
            onLoadMore={handleLoadMoreConversations}
            onRetry={handleRetryConversations}
            onUserSearchOpen={handleOpenUserSearch}
          />
        ) : null}
      </div>

      <CurrentUserSidebarSection />
      <CreateGroupDialogContainer
        isOpen={isCreateGroupOpen}
        isSubmitting={createGroupMutation.isPending}
        onOpenChange={setIsCreateGroupOpen}
        onCreate={handleCreateGroup}
      />
    </aside>
  );
}
