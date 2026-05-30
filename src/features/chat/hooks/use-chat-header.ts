import * as React from "react";
import {
  getFriendPopupAction,
  getFriendStatusLabel,
  getPresenceStatusLabel,
} from "@/features/friends/templates/user-item-template";
import type { Conversation, ConversationMember } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import type { UserInfo } from "@/types/user";
import {
  formatDirectConversationStatus,
  formatGroupActiveCount,
  getDisplayName,
} from "@/utils/display";

type UseChatHeaderParams = {
  conversation: Conversation;
  directMember?: ConversationMember;
  directUserInfo?: UserInfo;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  sendingFriendRequestId?: string | null;
};

export function useChatHeader({
  conversation,
  directMember,
  directUserInfo,
  onSendFriendRequest,
  sendingFriendRequestId,
}: UseChatHeaderParams) {
  const [isDirectUserDialogOpen, setIsDirectUserDialogOpen] =
    React.useState(false);
  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const statusLabel = isGroup
    ? formatGroupActiveCount(conversation)
    : formatDirectConversationStatus(conversation);
  const canOpenDirectUserDialog = !isGroup && !!directMember;
  const fallbackDialogUser = directMember
    ? {
        id: directMember.userId,
        displayName: directMember.displayName,
        firstName: directMember.firstName,
        lastName: directMember.lastName,
        username: directMember.username ?? undefined,
        avatarUrl: directMember.avatarUrl ?? undefined,
        bio: directMember.bio ?? undefined,
        joinedAt: directMember.joinedAt,
        presenceStatus: directMember.presenceStatus,
      }
    : null;
  const dialogUser = fallbackDialogUser
    ? directUserInfo
      ? {
          ...fallbackDialogUser,
          ...directUserInfo,
          displayName: getDisplayName(directUserInfo),
          avatarUrl:
            directUserInfo.avatarUrl ?? fallbackDialogUser.avatarUrl ?? null,
          bio: directUserInfo.bio ?? fallbackDialogUser.bio ?? null,
          phone: directUserInfo.phone ?? null,
          email: directUserInfo.email ?? null,
          joinedAt: directUserInfo.joinedAt ?? fallbackDialogUser.joinedAt,
        }
      : fallbackDialogUser
    : null;
  const friendStatus = directUserInfo?.statusFriend;
  const friendStatusLabel = getFriendStatusLabel(friendStatus);
  const popupAction = getFriendPopupAction(friendStatus);
  const canSendFriendRequest = !!directUserInfo && !!onSendFriendRequest;
  const presenceStatusLabel = getPresenceStatusLabel(
    dialogUser?.presenceStatus,
  );
  const isSendingFriendRequest =
    !!directMember && sendingFriendRequestId === directMember.userId;

  return {
    canOpenDirectUserDialog,
    canSendFriendRequest,
    dialogUser,
    directMember,
    friendStatus,
    friendStatusLabel,
    isDirectUserDialogOpen,
    isSendingFriendRequest,
    popupAction,
    presenceStatusLabel,
    setIsDirectUserDialogOpen,
    statusLabel,
  };
}
