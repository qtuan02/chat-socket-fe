import { ChatConversationPanel } from "@/features/chat/components/content/chat-conversation-panel";
import { MobileChatBottomNav } from "@/features/chat/components/mobile/mobile-chat-bottom-nav";
import { ChatSidebar } from "@/features/chat/components/sidebar/chat-sidebar";
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
    isDetailsOpen,
    isDraftConversation,
    openDraftConversation,
    shouldShowDetailsPanel,
    sidebarActiveConversationId,
    toggleDetails,
  } = useChatTemplate();

  const conversationPanelProps = {
    conversation: displayedConversation,
    detailsPanelActions,
    isConversationRoute,
    isDraftConversation,
    onBack: goToChatHome,
    onDraftMessageSent: handleDraftMessageSent,
    onOpenDetails: toggleDetails,
  };

  const sidebarProps = {
    activeConversationId: sidebarActiveConversationId,
    onConversationSelect: handleConversationSelect,
    onDirectMessageDraftSelect: openDraftConversation,
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
              {...sidebarProps}
              className="hidden md:flex md:w-[320px] md:border-r"
            />

            <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col border-l border-border md:border-l-0">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-16 md:hidden">
                {displayedConversation || isConversationRoute ? (
                  <ChatConversationPanel
                    {...conversationPanelProps}
                    showBackButton
                  />
                ) : (
                  <ChatSidebar {...sidebarProps} className="h-full" />
                )}
              </div>

              <div className="hidden min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex">
                <ChatConversationPanel {...conversationPanelProps} />
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
