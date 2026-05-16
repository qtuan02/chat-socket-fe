import { conversationDisplayLabels } from "@/features/conversation/constants/conversation-display";
import type { Conversation } from "@/types/conversation";
import { formatRelativeDurationWithLabels } from "@/utils/date";
import {
  getActiveMembersCount,
  getDirectConversationMember,
  isConversationOnline,
  isConversationPresenceKnown,
} from "./conversation-member";

export function getConversationActivityAt(conversation: Conversation) {
  const directMember = getDirectConversationMember(conversation);
  const activityAt = directMember?.lastActiveAt ?? conversation.lastMessageAt;

  if (activityAt && !Number.isNaN(new Date(activityAt).getTime())) {
    return activityAt;
  }

  return conversation.updatedAt;
}

export function formatRelativeActivity(value?: string | null) {
  return formatRelativeDurationWithLabels(value, {
    noValueFallback: conversationDisplayLabels.noActivity,
    justNowLabel: conversationDisplayLabels.activeJustNow,
    minutesLabel: (minutes) => `Active ${minutes} minutes ago`,
    hoursLabel: (hours) => `Active ${hours} hours ago`,
    daysLabel: (days) => `Active ${days} days ago`,
  });
}

export function formatDirectConversationStatus(conversation: Conversation) {
  const isOnline = isConversationOnline(conversation);

  if (isOnline === undefined) return conversationDisplayLabels.presencePending;
  if (isOnline) return conversationDisplayLabels.activeNow;

  return formatRelativeActivity(getConversationActivityAt(conversation));
}

export function formatGroupActiveCount(conversation: Conversation) {
  if (!isConversationPresenceKnown(conversation))
    return conversationDisplayLabels.presencePending;

  const activeMembersCount = getActiveMembersCount(conversation);
  const activeMemberLabel =
    activeMembersCount === 1
      ? conversationDisplayLabels.activeMemberSingular
      : conversationDisplayLabels.activeMemberPlural;

  return `${activeMembersCount} ${activeMemberLabel}`;
}
