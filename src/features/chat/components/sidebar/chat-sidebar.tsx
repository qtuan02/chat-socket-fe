import { useChatSidebar } from "@/features/chat/hooks/use-chat-sidebar";
import { ConversationSidebarTemplate } from "@/features/conversation/templates/conversation-sidebar-template";
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
    handleSelectConversation,
    handleSelectUser,
    isCreateGroupOpen,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
    setActiveView,
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
      {activeView === "user-search" ? (
        <div className="min-h-0 flex-1 p-3 md:p-4">
          <UserSearchList
            conversationIdByUserId={directConversationIdByUserId}
            onBack={() => {
              setActiveView("conversations");
            }}
            onSelectUser={handleSelectUser}
          />
        </div>
      ) : (
        <ConversationSidebarTemplate
          activeConversationId={activeConversationId}
          className="min-h-0 flex-1"
          conversationFilter={conversationFilter}
          conversations={conversations}
          error={error}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          onConversationFilterChange={setConversationFilter}
          onConversationSelect={handleSelectConversation}
          onCreateGroupClick={() => {
            setIsCreateGroupOpen(true);
          }}
          onLoadMore={handleLoadMoreConversations}
          onRetry={() => {
            void refetch();
          }}
          onUserSearchOpen={() => {
            setActiveView("user-search");
          }}
        />
      )}

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
