import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import { CurrentUserSidebarSection } from "@/features/current-user/templates/current-user-sidebar-section";
import {
  getDirectConversationIdByUserId,
  useConversationSidebar,
} from "@/features/conversation/hooks/use-conversation-sidebar";
import { ConversationSidebarTemplate } from "@/features/conversation/templates/conversation-sidebar-template";
import { CreateGroupDialogContainer } from "@/features/group/templates/create-group-dialog-container";
import { useCreateGroupConversationMutation } from "@/hooks/api/conversation";
import type {
  ConversationTypeEnum,
  CreateGroupConversationRequest,
} from "@/types/conversation";
import type { DirectMessageUser } from "@/types/user";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/error";
import { UserSearchList } from "./user-search-list";

type ChatSidebarProps = {
  className?: string;
  activeConversationId: string;
  onConversationSelect?: () => void;
  onDirectMessageDraftSelect?: (user: DirectMessageUser) => void;
};

type SidebarView = "conversations" | "user-search";

export function ChatSidebar({
  className,
  activeConversationId,
  onConversationSelect,
  onDirectMessageDraftSelect,
}: ChatSidebarProps) {
  const navigate = useNavigate();
  const [activeView, setActiveView] =
    React.useState<SidebarView>("conversations");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);
  const [conversationFilter, setConversationFilter] =
    React.useState<ConversationTypeEnum | null>(null);

  const {
    conversations,
    error,
    isError,
    isFetchingNextPage,
    isLoading,
    handleLoadMoreConversations,
    refetch,
  } = useConversationSidebar({
    activeConversationId,
    conversationFilter,
  });
  const createGroupMutation = useCreateGroupConversationMutation({
    onSuccess: (conversation) => {
      setIsCreateGroupOpen(false);
      toast.success("Group conversation created.");
      navigate(APP_ROUTES.conversationById(conversation.id));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create group."));
    },
  });

  const directConversationIdByUserId = React.useMemo(
    () => getDirectConversationIdByUserId(conversations),
    [conversations],
  );

  const handleSelectConversation = (conversationId: string) => {
    navigate(APP_ROUTES.conversationById(conversationId));
    onConversationSelect?.();
  };

  const handleSelectUser = (user: DirectMessageUser) => {
    const conversationId = directConversationIdByUserId.get(user.id);

    if (conversationId) {
      handleSelectConversation(conversationId);
    } else {
      onDirectMessageDraftSelect?.(user);
    }

    setActiveView("conversations");
  };

  const handleCreateGroup = (payload: CreateGroupConversationRequest) => {
    createGroupMutation.mutate(payload);
  };

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
