import * as React from "react";
import { useUserInfoQuery } from "@/hooks/api/user";
import type { Conversation, ConversationMember } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import { getDirectConversationMember } from "@/utils/display";
import { getErrorMessage } from "@/utils/error";

type UseDirectConversationFriendStatusParams = {
  conversation: Conversation;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  sendingFriendRequestId?: string | null;
};

export function useDirectConversationFriendStatus({
  conversation,
  onSendFriendRequest,
  sendingFriendRequestId,
}: UseDirectConversationFriendStatusParams) {
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

  return {
    directMember,
    directUserInfo: directUserInfoQuery.data,
    directUserInfoErrorMessage,
    handleAddFriend,
    isDirectConversation,
    isDirectUserInfoLoading,
    isSendingFriendRequest,
    statusFriend,
  };
}
