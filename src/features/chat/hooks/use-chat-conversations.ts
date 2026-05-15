import * as React from "react";
import {
  CONVERSATIONS_DEFAULT_LIMIT,
  useConversationsInfiniteQuery,
} from "@/hooks/api/conversation";
import { useCurrentUserQuery } from "@/hooks/api/user";
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
): Conversation {
  const members = conversation.participants.map((participant) => ({
    userId: participant.userId,
    id: participant.userId,
    displayName: getFullName({
      firstName: participant.firstName,
      lastName: participant.lastName,
    } as User),
    avatarUrl: participant.avatarUrl ?? undefined,
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
  const avatarUrl = isGroup
    ? members[0]?.avatarUrl
    : otherParticipant?.avatarUrl;

  return {
    id: conversation.id,
    type: conversation.type,
    title,
    lastMessage:
      conversation.lastMessage?.content?.trim() || "No messages yet.",
    lastMessageAt: conversation.lastMessageAt || "No messages yet.",
    participantCount: members.length,
    unreadCount: conversation.unreadCount,
    members,
    lastMessageId: conversation.lastMessageId,
    avatarUrl,
    onlineUsersCount: members.length,
  };
}

export function useChatConversations(type?: ConversationTypeEnum) {
  const { data: currentUser } = useCurrentUserQuery();
  const query = useConversationsInfiniteQuery({
    type,
    limit: CONVERSATIONS_DEFAULT_LIMIT,
  });

  const conversations = React.useMemo(() => {
    return (
      query.data?.pages.flatMap((page) =>
        page.items.map((conversation) =>
          mapConversationToUiModel(conversation, currentUser?.id ?? ""),
        ),
      ) ?? []
    );
  }, [currentUser?.id, query.data?.pages]);

  return {
    ...query,
    conversations,
  };
}
