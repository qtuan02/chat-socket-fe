import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageListSkeleton } from "@/features/chat/components/skeleton/message-list-skeleton";
import { useDirectConversationFriendStatus } from "@/features/chat/hooks/use-direct-conversation-friend-status";
import type { Conversation } from "@/types/conversation";
import type { MessageRecord } from "@/types/message";
import { ChatHeader } from "./chat-header";
import { DirectConversationFriendStatusRow } from "./direct-conversation-friend-status-row";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";

type ChatConversationContentBaseProps = {
  onBack?: () => void;
  showBackButton?: boolean;
};

type ChatConversationContentLoadingProps = ChatConversationContentBaseProps & {
  isConversationLoading: true;
};

type ChatConversationContentLoadedProps = ChatConversationContentBaseProps & {
  conversation: Conversation;
  isDraft: boolean;
  isConversationLoading?: false;
  onMessageSent?: (message: MessageRecord) => void;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  onOpenDetails?: () => void;
  sendingFriendRequestId?: string | null;
};

export type ChatConversationContentProps =
  | ChatConversationContentLoadingProps
  | ChatConversationContentLoadedProps;

type ChatConversationContentLoadingViewProps = {
  onBack?: () => void;
  showBackButton?: boolean;
};

function ChatConversationContentLoadingView({
  onBack,
  showBackButton,
}: ChatConversationContentLoadingViewProps) {
  return (
    <>
      <header className="h-14 border-b border-border bg-background px-3 py-2 md:h-16 md:px-4 md:py-2">
        <div className="flex h-full min-w-0 items-center gap-3">
          {showBackButton && onBack ? (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={onBack}
              className="md:hidden"
              aria-label="Go back to conversations"
            >
              <ArrowLeft className="size-4" />
            </Button>
          ) : null}
          <Skeleton className="size-9 shrink-0 rounded-full md:size-10" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36 max-w-full md:h-5" />
            <Skeleton className="h-3 w-24 max-w-full md:h-3.5" />
          </div>
        </div>
      </header>
      <MessageListSkeleton />
      <div className="border-t border-border p-3 pb-1 md:p-4">
        <Skeleton className="mb-3 h-20 w-full rounded-md" />
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
    </>
  );
}

export function ChatConversationContent(props: ChatConversationContentProps) {
  if (props.isConversationLoading) {
    return (
      <ChatConversationContentLoadingView
        onBack={props.onBack}
        showBackButton={props.showBackButton}
      />
    );
  }

  return <ChatConversationContentLoadedView {...props} />;
}

function ChatConversationContentLoadedView({
  conversation,
  isDraft,
  onBack,
  onMessageSent,
  onSendFriendRequest,
  onOpenDetails,
  sendingFriendRequestId,
  showBackButton,
}: ChatConversationContentLoadedProps) {
  const {
    directMember,
    directUserInfo,
    directUserInfoErrorMessage,
    handleAddFriend,
    isDirectConversation,
    isDirectUserInfoLoading,
    isSendingFriendRequest,
    statusFriend,
  } = useDirectConversationFriendStatus({
    conversation,
    onSendFriendRequest,
    sendingFriendRequestId,
  });

  return (
    <>
      <ChatHeader
        conversation={conversation}
        directMember={directMember}
        directUserInfo={directUserInfo}
        directUserInfoErrorMessage={directUserInfoErrorMessage}
        isDirectUserInfoLoading={isDirectUserInfoLoading}
        onBack={onBack}
        onSendFriendRequest={onSendFriendRequest}
        onOpenDetails={onOpenDetails}
        sendingFriendRequestId={sendingFriendRequestId}
        showBackButton={showBackButton}
      />
      {isDirectConversation ? (
        <DirectConversationFriendStatusRow
          statusFriend={statusFriend}
          isLoading={isDirectUserInfoLoading}
          isSendingFriendRequest={isSendingFriendRequest}
          onAddFriend={handleAddFriend}
        />
      ) : null}
      <MessageList conversation={conversation} isDraft={isDraft} />
      <MessageComposer
        conversation={conversation}
        onMessageSent={onMessageSent}
      />
    </>
  );
}
