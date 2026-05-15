import {
  type Conversation,
  type ConversationMember,
  ConversationTypeEnum,
} from "@/types/conversation";

const ONE_MINUTE_IN_MS = 60 * 1000;
const ONE_HOUR_IN_MS = 60 * ONE_MINUTE_IN_MS;
const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;

const NO_ACTIVITY_LABEL = "Ch\u01b0a c\u00f3 ho\u1ea1t \u0111\u1ed9ng";
const ACTIVE_NOW_LABEL = "\u0110ang ho\u1ea1t \u0111\u1ed9ng";
const ACTIVE_JUST_NOW_LABEL = "Ho\u1ea1t \u0111\u1ed9ng v\u1eeba xong";
const PRESENCE_PENDING_LABEL = "\u0110ang ki\u1ec3m tra tr\u1ea1ng th\u00e1i";

export function getNameInitials(name: string) {
  const normalizedName = name.trim();

  if (!normalizedName) return "--";

  const parts = normalizedName.split(" ").filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
  }

  return normalizedName.slice(0, 2).toUpperCase();
}

export function getMemberInitials(member: ConversationMember) {
  return getNameInitials(member.displayName);
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

export function getConversationActivityAt(conversation: Conversation) {
  const directMember = getDirectConversationMember(conversation);
  const activityAt = directMember?.lastActiveAt ?? conversation.lastMessageAt;

  if (activityAt && !Number.isNaN(new Date(activityAt).getTime())) {
    return activityAt;
  }

  return conversation.updatedAt;
}

export function getActiveMembersCount(conversation: Conversation) {
  return (
    conversation.onlineUsersCount ??
    conversation.members.filter((member) => member.isOnline === true).length
  );
}

export function isConversationPresenceKnown(conversation: Conversation) {
  if (conversation.type === ConversationTypeEnum.GROUP) {
    return conversation.members.every(
      (member) => typeof member.isOnline === "boolean",
    );
  }

  const directMember = getDirectConversationMember(conversation);
  return typeof directMember?.isOnline === "boolean";
}

export function isConversationOnline(conversation: Conversation) {
  if (!isConversationPresenceKnown(conversation)) return undefined;

  if (conversation.type === ConversationTypeEnum.GROUP) {
    return getActiveMembersCount(conversation) > 0;
  }

  return Boolean(getDirectConversationMember(conversation)?.isOnline);
}

export function formatRelativeActivity(value?: string | null) {
  if (!value) return NO_ACTIVITY_LABEL;

  const activityDate = new Date(value);
  if (Number.isNaN(activityDate.getTime())) return NO_ACTIVITY_LABEL;

  const diffInMs = Date.now() - activityDate.getTime();

  if (diffInMs < ONE_MINUTE_IN_MS) return ACTIVE_JUST_NOW_LABEL;

  if (diffInMs < ONE_HOUR_IN_MS) {
    const minutes = Math.max(1, Math.floor(diffInMs / ONE_MINUTE_IN_MS));
    return `Ho\u1ea1t \u0111\u1ed9ng ${minutes} ph\u00fat tr\u01b0\u1edbc`;
  }

  if (diffInMs < ONE_DAY_IN_MS) {
    const hours = Math.max(1, Math.floor(diffInMs / ONE_HOUR_IN_MS));
    return `Ho\u1ea1t \u0111\u1ed9ng ${hours} gi\u1edd tr\u01b0\u1edbc`;
  }

  const days = Math.max(1, Math.floor(diffInMs / ONE_DAY_IN_MS));
  return `Ho\u1ea1t \u0111\u1ed9ng ${days} ng\u00e0y tr\u01b0\u1edbc`;
}

export function formatDirectConversationStatus(conversation: Conversation) {
  const isOnline = isConversationOnline(conversation);

  if (isOnline === undefined) return PRESENCE_PENDING_LABEL;
  if (isOnline) return ACTIVE_NOW_LABEL;

  return formatRelativeActivity(getConversationActivityAt(conversation));
}

export function formatGroupActiveCount(conversation: Conversation) {
  if (!isConversationPresenceKnown(conversation)) return PRESENCE_PENDING_LABEL;

  return `${getActiveMembersCount(conversation)} ng\u01b0\u1eddi \u0111ang ho\u1ea1t \u0111\u1ed9ng`;
}
