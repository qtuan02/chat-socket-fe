import { MobileTopBackBar } from "@/components/shared/mobile-top-back-bar";
import { ChatConversationContent } from "@/features/chat/components/content/chat-conversation-content";
import { EmptyConversationBanner } from "@/features/chat/components/content/empty-conversation-banner";
import type { useConversationDetailsPanel } from "@/features/conversation/hooks/use-conversation-details-panel";
import type { Conversation } from "@/types/conversation";
import type { MessageRecord } from "@/types/message";

type ChatConversationPanelProps = {
  conversation: Conversation | null;
  detailsPanelActions: ReturnType<typeof useConversationDetailsPanel>;
  isConversationRoute: boolean;
  isDraftConversation: boolean;
  onBack?: () => void;
  onDraftMessageSent?: (message: MessageRecord) => void;
  onOpenDetails?: () => void;
  showBackButton?: boolean;
};

export function ChatConversationPanel({
  conversation,
  detailsPanelActions,
  isConversationRoute,
  isDraftConversation,
  onBack,
  onDraftMessageSent,
  onOpenDetails,
  showBackButton = false,
}: ChatConversationPanelProps) {
  if (!conversation) {
    if (isConversationRoute) {
      return (
        <ChatConversationContent
          isConversationLoading
          onBack={showBackButton ? onBack : undefined}
          showBackButton={showBackButton}
        />
      );
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {showBackButton && onBack ? (
          <MobileTopBackBar title="Conversations" onBack={onBack} />
        ) : null}
        <EmptyConversationBanner />
      </div>
    );
  }

  return (
    <ChatConversationContent
      conversation={conversation}
      isDraft={isDraftConversation}
      onBack={showBackButton ? onBack : undefined}
      onMessageSent={isDraftConversation ? onDraftMessageSent : undefined}
      onSendFriendRequest={detailsPanelActions.onSendFriendRequest}
      onOpenDetails={isDraftConversation ? undefined : onOpenDetails}
      sendingFriendRequestId={detailsPanelActions.sendingFriendRequestId}
      showBackButton={showBackButton}
    />
  );
}
