import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import { ConversationList } from "@/features/conversation/components/conversation-list";
import { ConversationSidebarHeader } from "@/features/conversation/components/conversation-sidebar-header";
import { FriendSearchList } from "@/features/friend-search/components/friend-search-list";
import { CreateGroupDialog } from "@/features/group/components/create-group-dialog";
import {
  useConversationsInfiniteQuery,
  useCreateGroupConversationMutation,
} from "@/hooks/api/conversation";
import {
  type Conversation,
  ConversationTypeEnum,
  type CreateGroupConversationRequest,
} from "@/types/conversation";
import type { Friend } from "@/types/friend";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/error";
import { ChatCurrentUserSection } from "../../../current-user/components/chat-current-user-section";

type ChatSidebarProps = {
  className?: string;
  activeConversationId: string;
  onConversationSelect?: () => void;
  onDirectMessageDraftSelect?: (friend: Friend) => void;
};

type SidebarView = "conversations" | "friend-search";

function getConversationTypeFilter(filter: ConversationTypeEnum | null) {
  return filter ?? undefined;
}

function getDirectConversationIdByFriendId(conversations: Conversation[]) {
  const directConversationIds = new Map<string, string>();

  for (const conversation of conversations) {
    const directMemberId = conversation.directMember?.userId;

    if (conversation.type === ConversationTypeEnum.DIRECT && directMemberId) {
      directConversationIds.set(directMemberId, conversation.id);
    }
  }

  return directConversationIds;
}

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
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useConversationsInfiniteQuery({
    type: getConversationTypeFilter(conversationFilter),
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

  const directConversationIdByFriendId = React.useMemo(
    () => getDirectConversationIdByFriendId(conversations),
    [conversations],
  );

  const handleSelectConversation = (conversationId: string) => {
    navigate(APP_ROUTES.conversationById(conversationId));
    onConversationSelect?.();
  };

  const handleSelectFriend = (friend: Friend) => {
    const conversationId = directConversationIdByFriendId.get(friend.id);

    if (conversationId) {
      handleSelectConversation(conversationId);
    } else {
      onDirectMessageDraftSelect?.(friend);
    }

    setActiveView("conversations");
  };

  const handleLoadMoreConversations = () => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
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
      <ConversationSidebarHeader
        onCreateGroupClick={() => {
          setIsCreateGroupOpen(true);
        }}
      />

      {activeView === "friend-search" ? (
        <div className="min-h-0 flex-1 p-3 md:p-4">
          <FriendSearchList
            conversationIdByFriendId={directConversationIdByFriendId}
            onBack={() => {
              setActiveView("conversations");
            }}
            onSelectFriend={handleSelectFriend}
          />
        </div>
      ) : (
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
          onFriendSearchOpen={() => {
            setActiveView("friend-search");
          }}
          onLoadMore={handleLoadMoreConversations}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      <ChatCurrentUserSection />

      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        isSubmitting={createGroupMutation.isPending}
        onOpenChange={setIsCreateGroupOpen}
        onCreate={handleCreateGroup}
      />
    </aside>
  );
}
