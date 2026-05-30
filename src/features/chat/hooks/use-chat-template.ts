import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import { useConversationAutoSeen } from "@/features/chat/hooks/use-conversation-auto-seen";
import { useDirectMessageDraft } from "@/features/chat/hooks/use-direct-message-draft";
import { cn } from "@/utils/cn";
import { useConversationDetailsPanel } from "@/features/conversation/hooks/use-conversation-details-panel";
import { useConversationsView } from "@/features/conversation/hooks/use-conversations-view";

export function useChatTemplate() {
  const { conversationId = "" } = useParams();
  const navigate = useNavigate();
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const { conversations, isLoading: isConversationsLoading } =
    useConversationsView();

  const activeConversation = React.useMemo(
    () =>
      conversations.find((conversation) => conversation.id === conversationId),
    [conversationId, conversations],
  );
  const isConversationRoute = Boolean(conversationId);
  const isChatHomeRoute = !isConversationRoute;

  const closeDetails = React.useCallback(() => {
    setIsDetailsOpen(false);
  }, []);
  const toggleDetails = React.useCallback(() => {
    setIsDetailsOpen((isOpen) => !isOpen);
  }, []);
  const goToChatHome = React.useCallback(() => {
    navigate(APP_ROUTES.chat);
  }, [navigate]);

  const {
    clearDraftConversation,
    draftConversation,
    handleDraftMessageSent,
    isDraftConversation,
    openDraftConversation,
    sentDraftConversation,
  } = useDirectMessageDraft({
    activeConversation,
    conversationId,
    isChatHomeRoute,
    isFriendsRoute: false,
    isProfileRoute: false,
    onCloseDetails: closeDetails,
  });

  const displayedConversation = isChatHomeRoute
    ? draftConversation
    : (activeConversation ??
      (sentDraftConversation?.id === conversationId
        ? sentDraftConversation
        : null));

  const sidebarActiveConversationId = isDraftConversation ? "" : conversationId;
  const detailsPanelActions = useConversationDetailsPanel();

  useConversationAutoSeen({
    conversation: activeConversation,
    isEnabled: !isDraftConversation && Boolean(activeConversation),
  });

  const handleConversationSelect = React.useCallback(() => {
    clearDraftConversation();
    closeDetails();
  }, [clearDraftConversation, closeDetails]);

  const shouldShowDetailsPanel = !!activeConversation && !isDraftConversation;

  const detailsPanelGridClass = cn(
    activeConversation && !isDraftConversation && isDetailsOpen
      ? "md:grid-cols-[320px_minmax(0,1fr)_320px]"
      : "md:grid-cols-[320px_minmax(0,1fr)]",
  );

  return {
    activeConversation,
    closeDetails,
    detailsPanelActions,
    detailsPanelGridClass,
    displayedConversation,
    goToChatHome,
    handleConversationSelect,
    handleDraftMessageSent,
    isConversationRoute,
    isConversationsLoading,
    isDetailsOpen,
    isDraftConversation,
    openDraftConversation,
    shouldShowDetailsPanel,
    sidebarActiveConversationId,
    toggleDetails,
  };
}
