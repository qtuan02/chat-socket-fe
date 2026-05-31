import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import {
  getDirectConversationIdByUserId,
  useConversationSidebar,
} from "@/features/conversation/hooks/use-conversation-sidebar";
import { useCreateGroupConversationMutation } from "@/hooks/api/conversation";
import type {
  ConversationTypeEnum,
  CreateGroupConversationRequest,
} from "@/types/conversation";
import type { DirectMessageUser } from "@/types/user";
import { getErrorMessage } from "@/utils/error";

type UseChatSidebarParams = {
  activeConversationId: string;
  onConversationSelect?: () => void;
  onDirectMessageDraftSelect?: (user: DirectMessageUser) => void;
};

type SidebarView = "conversations" | "user-search";

export function useChatSidebar({
  activeConversationId,
  onConversationSelect,
  onDirectMessageDraftSelect,
}: UseChatSidebarParams) {
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

  const handleSelectConversation = React.useCallback(
    (conversationId: string) => {
      navigate(APP_ROUTES.conversationById(conversationId));
      onConversationSelect?.();
    },
    [navigate, onConversationSelect],
  );

  const handleSelectUser = React.useCallback(
    (user: DirectMessageUser) => {
      const conversationId = directConversationIdByUserId.get(user.id);

      if (conversationId) {
        handleSelectConversation(conversationId);
      } else {
        onDirectMessageDraftSelect?.(user);
      }

      setActiveView("conversations");
    },
    [
      directConversationIdByUserId,
      handleSelectConversation,
      onDirectMessageDraftSelect,
    ],
  );

  const handleCreateGroup = React.useCallback(
    (payload: CreateGroupConversationRequest) => {
      createGroupMutation.mutate(payload);
    },
    [createGroupMutation],
  );

  const handleOpenCreateGroup = React.useCallback(() => {
    setIsCreateGroupOpen(true);
  }, []);

  const handleShowConversations = React.useCallback(() => {
    setActiveView("conversations");
  }, []);

  const handleOpenUserSearch = React.useCallback(() => {
    setActiveView("user-search");
  }, []);

  const handleRetryConversations = React.useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
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
  };
}
