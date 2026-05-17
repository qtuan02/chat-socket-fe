import type { Conversation } from "@/types/conversation";
import type { MessageDto } from "@/types/message";
import { ChatHeader } from "./chat-header";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";

type ChatConversationContentProps = {
  conversation: Conversation;
  isDraft: boolean;
  onBack?: () => void;
  onMessageSent?: (message: MessageDto) => void;
  onOpenDetails?: () => void;
  showBackButton?: boolean;
};

export function ChatConversationContent({
  conversation,
  isDraft,
  onBack,
  onMessageSent,
  onOpenDetails,
  showBackButton,
}: ChatConversationContentProps) {
  return (
    <>
      <ChatHeader
        conversation={conversation}
        onBack={onBack}
        onOpenDetails={onOpenDetails}
        showBackButton={showBackButton}
      />
      <MessageList conversation={conversation} isDraft={isDraft} />
      <MessageComposer
        conversation={conversation}
        onMessageSent={onMessageSent}
      />
    </>
  );
}
