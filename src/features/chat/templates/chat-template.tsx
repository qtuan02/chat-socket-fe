import { ChatConversationContent } from "@/features/chat/components/content/chat-conversation-content";
import { EmptyConversationBanner } from "@/features/chat/components/content/empty-conversation-banner";
import { MobileChatBottomNav } from "@/features/chat/components/mobile/mobile-chat-bottom-nav";
import { MobileTopBackBar } from "@/features/chat/components/mobile/mobile-top-back-bar";
import { ChatSidebar } from "@/features/chat/components/sidebar/chat-sidebar";
import { WelcomeSkeleton } from "@/features/chat/components/skeleton/welcome-skeleton";
import { useChatTemplate } from "@/features/chat/hooks/use-chat-template";
import { ConversationDetailsPanelTemplate } from "@/features/conversation/templates/conversation-details-panel-template";
import { cn } from "@/utils/cn";

export function ChatTemplate() {
  const {
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
  } = useChatTemplate();

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

  return (
    <>
      <main className="min-h-screen h-dvh w-full overflow-hidden bg-muted/50 md:h-screen md:min-h-screen">
        <div className="h-full w-full min-w-0 bg-background">
          <div
            className={cn(
              "grid h-full min-h-0 w-full overflow-hidden",
              detailsPanelGridClass,
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
              />
            ) : null}
          </div>
        </div>
      </main>
      <MobileChatBottomNav />
    </>
  );
}
