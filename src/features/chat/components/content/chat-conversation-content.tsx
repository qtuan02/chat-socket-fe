import * as React from "react";
import { Button } from "@/components/ui/button";
import { useUserInfoQuery } from "@/hooks/api/user";
import type { Conversation, ConversationMember } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import { FriendStatus } from "@/types/friend-status";
import type { MessageRecord } from "@/types/message";
import { getDirectConversationMember } from "@/utils/display";
import { getErrorMessage } from "@/utils/error";
import { ChatHeader } from "./chat-header";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";

type ChatConversationContentProps = {
  conversation: Conversation;
  isDraft: boolean;
  onBack?: () => void;
  onMessageSent?: (message: MessageRecord) => void;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  onOpenDetails?: () => void;
  sendingFriendRequestId?: string | null;
  showBackButton?: boolean;
};

type DirectConversationFriendStatusRowProps = {
  statusFriend?: FriendStatus;
  isLoading: boolean;
  isSendingFriendRequest: boolean;
  onAddFriend: () => void;
};

function DirectConversationFriendStatusRow({
  statusFriend,
  isLoading,
  isSendingFriendRequest,
  onAddFriend,
}: DirectConversationFriendStatusRowProps) {
  if (isLoading) return null;
  if (!statusFriend) return null;
  if (
    statusFriend === FriendStatus.FRIEND ||
    statusFriend === FriendStatus.SELF
  ) {
    return null;
  }

  if (statusFriend === FriendStatus.NONE) {
    return (
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2 md:px-4">
        <p className="truncate text-xs text-muted-foreground">
          You are not friends yet.
        </p>
        <Button
          type="button"
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={onAddFriend}
          disabled={isSendingFriendRequest}
        >
          {isSendingFriendRequest ? "Sending..." : "Add friend"}
        </Button>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground md:px-4">
      {statusFriend === FriendStatus.SENT
        ? "Friend request pending."
        : "This user sent you a friend request."}
    </div>
  );
}

export function ChatConversationContent({
  conversation,
  isDraft,
  onBack,
  onMessageSent,
  onSendFriendRequest,
  onOpenDetails,
  sendingFriendRequestId,
  showBackButton,
}: ChatConversationContentProps) {
  const isDirectConversation =
    conversation.type === ConversationTypeEnum.DIRECT;
  const directMember: ConversationMember | undefined = isDirectConversation
    ? getDirectConversationMember(conversation)
    : undefined;
  const directUserId = directMember?.userId ?? null;
  const directUserInfoQuery = useUserInfoQuery(directUserId, {
    enabled: isDirectConversation && !!directUserId,
  });
  const statusFriend = directUserInfoQuery.data?.statusFriend;
  const isSendingFriendRequest =
    !!directUserId && sendingFriendRequestId === directUserId;
  const isDirectUserInfoLoading =
    directUserInfoQuery.isLoading || directUserInfoQuery.isFetching;
  const directUserInfoErrorMessage = directUserInfoQuery.error
    ? getErrorMessage(directUserInfoQuery.error, "Unable to load user details.")
    : null;

  const handleAddFriend = React.useCallback(() => {
    if (!directUserId || isSendingFriendRequest) return;

    onSendFriendRequest?.(directUserId);
  }, [directUserId, isSendingFriendRequest, onSendFriendRequest]);

  return (
    <>
      <ChatHeader
        conversation={conversation}
        directMember={directMember}
        directUserInfo={directUserInfoQuery.data}
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
