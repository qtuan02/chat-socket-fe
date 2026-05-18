import { CONVERSATION_LABELS } from "@/config/constant";
import type { Conversation, ConversationMember } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import { PresenceStatusEnum, presenceStatusLabels } from "@/types/user";
import { formatRelativeActivity as formatRelativeActivityWithLabels } from "@/utils/date";

export type DisplayableNameInput = {
  displayName?: string | null;
  firstName?: string | null;
  id?: string | null;
  lastName?: string | null;
  username?: string | null;
};

export function getDisplayName(user: DisplayableNameInput): string {
  const explicitDisplayName = user.displayName?.trim();
  if (explicitDisplayName) return explicitDisplayName;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return fullName || user.username || user.id || "-";
}

export function getDisplayNameInitials(name?: string) {
  const normalizedName = (name ?? "").trim();

  if (!normalizedName) return "--";

  const parts = normalizedName.split(" ").filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
  }

  return normalizedName.slice(0, 2).toUpperCase();
}

export function getUsernameLabel(username?: string | null) {
  if (!username) return null;

  return username.startsWith("@") ? username : `@${username}`;
}

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

export function getConversationActivityAt(conversation: Conversation) {
  const directMember = getDirectConversationMember(conversation);
  const activityAt = directMember?.lastActiveAt ?? conversation.lastMessageAt;

  if (activityAt && !Number.isNaN(new Date(activityAt).getTime())) {
    return activityAt;
  }

  return conversation.updatedAt;
}

export function formatRelativeActivity(value?: string | null) {
  return formatRelativeActivityWithLabels(value, {
    noActivityLabel: CONVERSATION_LABELS.noActivity,
    activeJustNowLabel: CONVERSATION_LABELS.activeJustNow,
    activeMinutesLabel: (minutes) => `Active ${minutes} minutes ago`,
    activeHoursLabel: (hours) => `Active ${hours} hours ago`,
    activeDaysLabel: (days) => `Active ${days} days ago`,
  });
}

export function formatDirectConversationStatus(conversation: Conversation) {
  const isOnline = isConversationOnline(conversation);

  if (isOnline === undefined) return CONVERSATION_LABELS.presencePending;
  if (isOnline) return CONVERSATION_LABELS.activeNow;

  return formatRelativeActivity(getConversationActivityAt(conversation));
}

export function formatGroupActiveCount(conversation: Conversation) {
  if (!isConversationPresenceKnown(conversation)) {
    return CONVERSATION_LABELS.presencePending;
  }

  const activeMembersCount = getActiveMembersCount(conversation);
  const activeMemberLabel =
    activeMembersCount === 1
      ? CONVERSATION_LABELS.activeMemberSingular
      : CONVERSATION_LABELS.activeMemberPlural;

  return `${activeMembersCount} ${activeMemberLabel}`;
}
