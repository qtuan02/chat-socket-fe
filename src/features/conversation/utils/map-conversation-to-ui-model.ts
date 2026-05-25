import type {
  Conversation,
  ConversationMember,
  ConversationRecord,
} from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import { PresenceStatusEnum } from "@/types/user";

export function mapConversationToUiModel(
  conversation: ConversationRecord,
  currentUserId: string,
  onlineUserIds: ReadonlySet<string>,
): Conversation {
  const members: ConversationMember[] = conversation.participants.map(
    (participant) => ({
      userId: participant.userId,
      id: participant.userId,
      firstName: participant.firstName,
      lastName: participant.lastName,
      displayName:
        [participant.firstName, participant.lastName]
          .filter(Boolean)
          .join(" ") ||
        participant.username ||
        "Unknown user",
      username: participant.username ?? undefined,
      avatarUrl: participant.avatarUrl ?? undefined,
      bio: participant.bio,
      presenceStatus: onlineUserIds.has(participant.userId)
        ? PresenceStatusEnum.Online
        : PresenceStatusEnum.Offline,
      role: participant.role,
      joinedAt: participant.joinedAt,
      lastReadMessageId: participant.lastReadMessageId ?? null,
      lastReadAt: participant.lastReadAt ?? null,
    }),
  );

  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const otherParticipant = members.find(
    (member) => member.userId !== currentUserId,
  );
  const lastMessageSenderId = conversation.lastMessage?.senderId;
  const lastMessageSender = conversation.lastMessage
    ? members.find((member) => member.userId === lastMessageSenderId)
    : undefined;

  return {
    id: conversation.id,
    type: conversation.type,
    title: isGroup
      ? conversation.groupName || "Group conversation"
      : otherParticipant?.displayName || "Direct message",
    groupName: conversation.groupName,
    createdById: conversation.createdById,
    directUserAId: conversation.directUserAId,
    directUserBId: conversation.directUserBId,
    lastMessage:
      conversation.lastMessage?.content?.trim() || "No messages yet.",
    lastMessageAt: conversation.lastMessageAt,
    lastMessageSenderId: conversation.lastMessage?.senderId,
    lastMessageSenderName: lastMessageSender?.displayName,
    participantCount: members.length,
    unreadCount: conversation.unreadCount,
    members,
    directMember: isGroup ? undefined : otherParticipant,
    currentUserId: currentUserId || undefined,
    lastMessageId: conversation.lastMessageId,
    avatarUrl:
      isGroup || !otherParticipant?.avatarUrl
        ? undefined
        : otherParticipant.avatarUrl,
    onlineUsersCount: members.filter(
      (member) => member.presenceStatus === PresenceStatusEnum.Online,
    ).length,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}
