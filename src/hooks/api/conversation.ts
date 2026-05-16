import { useInfiniteQuery } from "@tanstack/react-query";
import * as React from "react";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { queryKeysFactory } from "@/libs/query-key-factory";
import { conversationService } from "@/services/conversation-service";
import { useSocketStore } from "@/stores/useSocketStore";
import {
  type Conversation,
  type ConversationDto,
  type ConversationPage,
  ConversationTypeEnum,
  type GetConversationsParams,
} from "@/types/conversation";

const conversationQueryKeyFactory =
  queryKeysFactory<"conversation">("conversation");

export const conversationQueryKeys = {
  ...conversationQueryKeyFactory,
  list: (type?: ConversationTypeEnum, limit = 30) =>
    conversationQueryKeyFactory.list({ type, limit }),
};

export const CONVERSATIONS_DEFAULT_LIMIT = 30;

function mapConversationToUiModel(
  conversation: ConversationDto,
  currentUserId: string,
  onlineUserIds: ReadonlySet<string>,
  isPresenceReady: boolean,
): Conversation {
  const members = conversation.participants.map((participant) => ({
    userId: participant.userId,
    id: participant.userId,
    displayName:
      [participant.firstName, participant.lastName].filter(Boolean).join(" ") ||
      participant.username ||
      "Unknown user",
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
  const lastMessageSender = conversation.lastMessage
    ? members.find(
        (member) => member.userId === conversation.lastMessage?.senderId,
      )
    : undefined;

  return {
    id: conversation.id,
    type: conversation.type,
    title: isGroup
      ? conversation.groupName || "Group conversation"
      : otherParticipant?.displayName || "Direct message",
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
    avatarUrl: isGroup ? undefined : otherParticipant?.avatarUrl,
    onlineUsersCount: isPresenceReady
      ? members.filter((member) => member.isOnline).length
      : undefined,
    updatedAt: conversation.updatedAt,
  };
}

export function useConversationsInfiniteQuery(
  params: Omit<GetConversationsParams, "cursor"> & {
    limit?: number;
  } = {},
) {
  const { type, limit = CONVERSATIONS_DEFAULT_LIMIT } = params;
  const { data: currentUser } = useCurrentUserQuery();
  const isPresenceReady = useSocketStore((state) => state.isPresenceReady);
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const onlineUserIds = React.useMemo(
    () => new Set(onlineUsers),
    [onlineUsers],
  );

  const query = useInfiniteQuery<
    ConversationPage,
    Error,
    {
      pages: Array<ConversationPage>;
      pageParams: Array<string | undefined>;
    },
    ReturnType<typeof conversationQueryKeys.list>,
    string | undefined
  >({
    queryKey: conversationQueryKeys.list(type, limit),
    queryFn: ({ pageParam }) =>
      conversationService.getConversations({
        type,
        limit,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });

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
