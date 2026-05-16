import type { Conversation, ConversationMember } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import { PresenceStatusEnum, presenceStatusLabels } from "@/types/user";

const isPresenceKnown = (member?: ConversationMember) =>
  member?.presenceStatus !== PresenceStatusEnum.Checking;

export function getMemberPresenceLabel(member: ConversationMember) {
  return (
    presenceStatusLabels[member.presenceStatus] ??
    presenceStatusLabels[PresenceStatusEnum.Checking]
  );
}

export function getDirectConversationMember(conversation: Conversation) {
  if (conversation.directMember) return conversation.directMember;

  return (
    conversation.members.find(
      (member) => member.userId !== conversation.currentUserId,
    ) ?? conversation.members[0]
  );
}

export function getConversationAvatarMembers(conversation: Conversation) {
  if (conversation.type === ConversationTypeEnum.GROUP) {
    return conversation.members.slice(0, 2);
  }

  const directMember = getDirectConversationMember(conversation);
  return directMember ? [directMember] : [];
}

export function getActiveMembersCount(conversation: Conversation) {
  return (
    conversation.onlineUsersCount ??
    conversation.members.filter(
      (member) => member.presenceStatus === PresenceStatusEnum.Online,
    ).length
  );
}

export function isConversationPresenceKnown(conversation: Conversation) {
  if (conversation.type === ConversationTypeEnum.GROUP) {
    return conversation.members.every((member) => isPresenceKnown(member));
  }

  const directMember = getDirectConversationMember(conversation);
  return isPresenceKnown(directMember);
}

export function isConversationOnline(conversation: Conversation) {
  if (!isConversationPresenceKnown(conversation)) return undefined;

  if (conversation.type === ConversationTypeEnum.GROUP) {
    return getActiveMembersCount(conversation) > 0;
  }

  return (
    getDirectConversationMember(conversation)?.presenceStatus ===
    PresenceStatusEnum.Online
  );
}
