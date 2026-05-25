import * as React from "react";
import { useConversationsView } from "@/features/conversation/hooks/use-conversations-view";
import { type Conversation, ConversationTypeEnum } from "@/types/conversation";

type UseConversationSidebarParams = {
  activeConversationId: string;
  conversationFilter: ConversationTypeEnum | null;
  onConversationSelect?: () => void;
};

function getConversationTypeFilter(filter: ConversationTypeEnum | null) {
  return filter ?? undefined;
}

export function useConversationSidebar({
  activeConversationId,
  conversationFilter,
}: UseConversationSidebarParams) {
  const {
    conversations,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useConversationsView({
    type: getConversationTypeFilter(conversationFilter),
  });

  const handleLoadMoreConversations = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    activeConversationId,
    conversations,
    error,
    isError,
    isFetchingNextPage,
    isLoading,
    handleLoadMoreConversations,
    refetch,
  };
}

export function getDirectConversationIdByUserId(conversations: Conversation[]) {
  const directConversationIds = new Map<string, string>();

  for (const conversation of conversations) {
    const directMemberId = conversation.directMember?.userId;

    if (conversation.type === ConversationTypeEnum.DIRECT && directMemberId) {
      directConversationIds.set(directMemberId, conversation.id);
    }
  }

  return directConversationIds;
}
