import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import { ChatConversationContent } from "@/features/chat/components/content/chat-conversation-content";
import { EmptyConversationBanner } from "@/features/chat/components/content/empty-conversation-banner";
import { MobileChatBottomNav } from "@/features/chat/components/mobile/mobile-chat-bottom-nav";
import { MobileTopBackBar } from "@/features/chat/components/mobile/mobile-top-back-bar";
import { ChatSidebar } from "@/features/chat/components/sidebar/chat-sidebar";
import { WelcomeSkeleton } from "@/features/chat/components/skeleton/welcome-skeleton";
import { useConversationAutoSeen } from "@/features/chat/hooks/use-conversation-auto-seen";
import { useDirectMessageDraft } from "@/features/chat/hooks/use-direct-message-draft";
import { useConversationDetailsPanel } from "@/features/conversation/hooks/use-conversation-details-panel";
import { ConversationDetailsPanelTemplate } from "@/features/conversation/templates/conversation-details-panel-template";
import { useGroupConversationActions } from "@/features/group/hooks/use-group-conversation-actions";
import { useConversationsView } from "@/features/conversation/hooks/use-conversations-view";
import { cn } from "@/utils/cn";

export function ChatTemplate() {
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

  const groupActions = useGroupConversationActions({
    conversation: activeConversation,
    onCloseDetails: closeDetails,
  });
  const detailsPanelActions = useConversationDetailsPanel();

  useConversationAutoSeen({
    conversation: activeConversation,
    isEnabled: !isDraftConversation && Boolean(activeConversation),
  });

  const handleConversationSelect = React.useCallback(() => {
    clearDraftConversation();
    closeDetails();
  }, [clearDraftConversation, closeDetails]);

  const renderConversationContent = (showBackButton = false) => {
    if (!displayedConversation) {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {showBackButton ? (
            <MobileTopBackBar title="Conversations" onBack={goToChatHome} />
          ) : null}
          {isConversationsLoading ? (
            <WelcomeSkeleton />
          ) : (
            <EmptyConversationBanner />
          )}
        </div>
      );
    }

    return (
      <ChatConversationContent
        conversation={displayedConversation}
        isDraft={isDraftConversation}
        onBack={showBackButton ? goToChatHome : undefined}
        onMessageSent={isDraftConversation ? handleDraftMessageSent : undefined}
        onSendFriendRequest={detailsPanelActions.onSendFriendRequest}
        onOpenDetails={isDraftConversation ? undefined : toggleDetails}
        sendingFriendRequestId={detailsPanelActions.sendingFriendRequestId}
        showBackButton={showBackButton}
      />
    );
  };

  const shouldShowDetailsPanel = !!activeConversation && !isDraftConversation;

  return (
    <>
      <main className="min-h-screen h-dvh w-full overflow-hidden bg-muted/50 md:h-screen md:min-h-screen">
        <div className="h-full w-full min-w-0 bg-background">
          <div
            className={cn(
              "grid h-full min-h-0 w-full overflow-hidden",
              activeConversation && !isDraftConversation && isDetailsOpen
                ? "md:grid-cols-[320px_minmax(0,1fr)_320px]"
                : "md:grid-cols-[320px_minmax(0,1fr)]",
            )}
          >
            <ChatSidebar
              activeConversationId={sidebarActiveConversationId}
              className="hidden md:flex md:w-[320px] md:border-r"
              onConversationSelect={handleConversationSelect}
              onDirectMessageDraftSelect={openDraftConversation}
            />

            <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col border-l border-border md:border-l-0">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-16 md:hidden">
                {displayedConversation || isConversationRoute ? (
                  renderConversationContent(true)
                ) : (
                  <ChatSidebar
                    activeConversationId={sidebarActiveConversationId}
                    className="h-full"
                    onConversationSelect={handleConversationSelect}
                    onDirectMessageDraftSelect={openDraftConversation}
                  />
                )}
              </div>
              <div className="hidden min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex">
                {renderConversationContent()}
              </div>
            </section>

            {shouldShowDetailsPanel && activeConversation ? (
              <ConversationDetailsPanelTemplate
                conversation={activeConversation}
                open={isDetailsOpen}
                onClose={closeDetails}
                groupActions={groupActions}
                detailsPanelActions={detailsPanelActions}
              />
            ) : null}
          </div>
        </div>
      </main>
      <MobileChatBottomNav />
    </>
  );
}
