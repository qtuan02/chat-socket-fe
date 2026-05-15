import * as React from "react";
import {
  CONVERSATIONS_DEFAULT_LIMIT,
  useConversationsInfiniteQuery,
} from "@/hooks/api/conversation";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { useSocketStore } from "@/stores/useSocketStore";
import type { Conversation, ConversationDto } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import type { User } from "@/types/user";
import { getFullName } from "@/utils/string";

export function getConversationTypeFilter(
  filter?: ConversationTypeEnum | null,
): ConversationTypeEnum | undefined {
  if (filter === ConversationTypeEnum.GROUP) return ConversationTypeEnum.GROUP;
  if (filter === ConversationTypeEnum.DIRECT)
    return ConversationTypeEnum.DIRECT;

  return undefined;
}

function mapConversationToUiModel(
  conversation: ConversationDto,
  currentUserId: string,
  onlineUserIds: ReadonlySet<string>,
  isPresenceReady: boolean,
): Conversation {
  const members = conversation.participants.map((participant) => ({
    userId: participant.userId,
    id: participant.userId,
    displayName: getFullName({
      username: participant.username ?? "",
      firstName: participant.firstName,
      lastName: participant.lastName,
    } as User),
    username: participant.username ?? undefined,
    avatarUrl: participant.avatarUrl ?? undefined,
    isOnline: isPresenceReady
      ? onlineUserIds.has(participant.userId)
      : undefined,
    role: participant.role,
    joinedAt: participant.joinedAt,
  }));

  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const otherParticipant = members.find(
    (member) => member.userId !== currentUserId,
  );
  const title = isGroup
    ? conversation.groupName || "Group conversation"
    : otherParticipant?.displayName || "Direct message";
  const avatarUrl = isGroup ? undefined : otherParticipant?.avatarUrl;
  const lastMessageSender = conversation.lastMessage
    ? members.find(
        (member) => member.userId === conversation.lastMessage?.senderId,
      )
    : undefined;
  const onlineUsersCount = isPresenceReady
    ? members.filter((member) => member.isOnline).length
    : undefined;

  return {
    id: conversation.id,
    type: conversation.type,
    title,
    lastMessage:
      conversation.lastMessage?.content?.trim() || "No messages yet.",
    lastMessageAt: conversation.lastMessageAt || "No messages yet.",
    lastMessageSenderId: conversation.lastMessage?.senderId,
    lastMessageSenderName: lastMessageSender?.displayName,
    participantCount: members.length,
    unreadCount: conversation.unreadCount,
    members,
    directMember: isGroup ? undefined : otherParticipant,
    currentUserId: currentUserId || undefined,
    lastMessageId: conversation.lastMessageId,
    avatarUrl,
    onlineUsersCount,
    updatedAt: conversation.updatedAt,
  };
}

export function useChatConversations(type?: ConversationTypeEnum) {
  const { data: currentUser } = useCurrentUserQuery();
  const isPresenceReady = useSocketStore((state) => state.isPresenceReady);
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const query = useConversationsInfiniteQuery({
    type,
    limit: CONVERSATIONS_DEFAULT_LIMIT,
  });
  const onlineUserIds = React.useMemo(
    () => new Set(onlineUsers),
    [onlineUsers],
  );

  const conversations = React.useMemo(() => {
    return (
      query.data?.pages.flatMap((page) =>
        page.items.map((conversation) =>
          mapConversationToUiModel(
            conversation,
            currentUser?.id ?? "",
            onlineUserIds,
            isPresenceReady,
          ),
        ),
      ) ?? []
    );
  }, [currentUser?.id, isPresenceReady, onlineUserIds, query.data?.pages]);

  return {
    ...query,
    conversations,
  };
}
