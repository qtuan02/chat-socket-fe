import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import { ChatConversationContent } from "@/features/chat/components/content/chat-conversation-content";
import { MobileChatBottomNav } from "@/features/chat/components/mobile/mobile-chat-bottom-nav";
import { MobileTopBackBar } from "@/features/chat/components/mobile/mobile-top-back-bar";
import { ChatSidebar } from "@/features/chat/components/sidebar/chat-sidebar";
import { useConversationAutoSeen } from "@/features/chat/hooks/use-conversation-auto-seen";
import { useConversationDetailsActions } from "@/features/chat/hooks/use-conversation-details-actions";
import { useDirectMessageDraft } from "@/features/chat/hooks/use-direct-message-draft";
import { ChatProfileTemplate } from "@/features/chat/templates/chat-profile-template";
import { ConversationDetailsPanel } from "@/features/conversation/components/conversation-details-panel";
import { FriendsTemplate } from "@/features/friends/templates/friends-template";
import { useConversationsInfiniteQuery } from "@/hooks/api/conversation";
import { cn } from "@/utils/cn";
import { EmptyConversationBanner } from "../components/content/empty-conversation-banner";
import { WelcomeSkeleton } from "../components/skeleton/welcome-skeleton";

export function ChatTemplate() {
  const { conversationId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const { conversations, isLoading: isConversationsLoading } =
    useConversationsInfiniteQuery();

  const activeConversation = React.useMemo(
    () =>
      conversations.find((conversation) => conversation.id === conversationId),
    [conversationId, conversations],
  );
  const isConversationRoute = Boolean(conversationId);
  const isChatHomeRoute = location.pathname === APP_ROUTES.chat;
  const isFriendsRoute = location.pathname === APP_ROUTES.friends;
  const isProfileRoute = location.pathname === APP_ROUTES.profile;
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
    isFriendsRoute,
    isProfileRoute,
    onCloseDetails: closeDetails,
  });
  const displayedConversation = isChatHomeRoute
    ? draftConversation
    : isConversationRoute
      ? (activeConversation ??
        (sentDraftConversation?.id === conversationId
          ? sentDraftConversation
          : null))
      : null;
  const sidebarActiveConversationId =
    isDraftConversation || isFriendsRoute || isProfileRoute
      ? ""
      : conversationId;
  const detailsActions = useConversationDetailsActions({
    conversation: activeConversation,
    onCloseDetails: closeDetails,
  });

  useConversationAutoSeen({
    conversation: activeConversation,
    isEnabled: !isDraftConversation && !isFriendsRoute && !isProfileRoute,
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
        onSendFriendRequest={detailsActions.onSendFriendRequest}
        onOpenDetails={isDraftConversation ? undefined : toggleDetails}
        sendingFriendRequestId={detailsActions.sendingFriendRequestId}
        showBackButton={showBackButton}
      />
    );
  };

  const renderMobileRouteContent = () => {
    if (displayedConversation || isConversationRoute) {
      return renderConversationContent(true);
    }

    if (isFriendsRoute) {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <MobileTopBackBar title="Friends" onBack={goToChatHome} />
          <FriendsTemplate />
        </div>
      );
    }

    if (isProfileRoute) {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <MobileTopBackBar title="Profile" onBack={goToChatHome} />
          <ChatProfileTemplate />
        </div>
      );
    }

    return (
      <ChatSidebar
        activeConversationId={sidebarActiveConversationId}
        className="h-full pb-16"
        onConversationSelect={handleConversationSelect}
        onDirectMessageDraftSelect={openDraftConversation}
      />
    );
  };

  const renderDesktopContent = () => {
    if (isProfileRoute) {
      return <ChatProfileTemplate />;
    }

    if (isFriendsRoute) {
      return <FriendsTemplate />;
    }

    return renderConversationContent();
  };

  const shouldShowDetailsPanel =
    !!activeConversation &&
    !isDraftConversation &&
    !isFriendsRoute &&
    !isProfileRoute;

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
                {renderMobileRouteContent()}
              </div>
              <div className="hidden min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex">
                {renderDesktopContent()}
              </div>
            </section>

            {shouldShowDetailsPanel ? (
              <ConversationDetailsPanel
                conversation={activeConversation}
                open={isDetailsOpen}
                {...detailsActions}
                onClose={closeDetails}
              />
            ) : null}
          </div>
        </div>
      </main>
      <MobileChatBottomNav />
    </>
  );
}
