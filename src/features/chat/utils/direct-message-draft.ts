import type { Conversation, ConversationMember } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import type { DirectMessageUser, User } from "@/types/user";
import { PresenceStatusEnum } from "@/types/user";
import { createDraftConversationId } from "@/utils/conversation";
import { getDisplayName } from "@/utils/display";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

export function isDirectMessageUser(
  value: unknown,
): value is DirectMessageUser {
  if (!isRecord(value)) return false;

  const user = value;
  const hasValidAvatarUrl =
    user.avatarUrl === undefined ||
    user.avatarUrl === null ||
    typeof user.avatarUrl === "string";

  return (
    typeof user.id === "string" &&
    typeof user.username === "string" &&
    typeof user.firstName === "string" &&
    typeof user.lastName === "string" &&
    typeof user.joinedAt === "string" &&
    hasValidAvatarUrl
  );
}

export function getDraftUserFromLocationState(state: unknown) {
  if (!isRecord(state)) return null;

  const draftUser = state.directMessageDraftUser;

  return isDirectMessageUser(draftUser) ? draftUser : null;
}

function isPendingConversation(value: unknown): value is Conversation {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    (value.type === ConversationTypeEnum.DIRECT ||
      value.type === ConversationTypeEnum.GROUP) &&
    typeof value.title === "string" &&
    Array.isArray(value.members)
  );
}

export function getPendingConversationFromLocationState(state: unknown) {
  if (!isRecord(state)) return null;

  const pendingConversation = state.pendingConversation;

  return isPendingConversation(pendingConversation)
    ? pendingConversation
    : null;
}

export function createDirectMessageDraftConversation({
  currentUser,
  user,
  presenceStatus,
}: {
  currentUser?: User;
  user: DirectMessageUser;
  presenceStatus: PresenceStatusEnum;
}): Conversation {
  const now = new Date().toISOString();
  const userDisplayName = getDisplayName(user);
  const directMember: ConversationMember = {
    id: user.id,
    userId: user.id,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    displayName: userDisplayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    joinedAt: user.joinedAt,
    lastReadMessageId: null,
    lastReadAt: null,
    presenceStatus,
  };
  const currentUserMember: ConversationMember | null = currentUser
    ? {
        id: currentUser.id,
        userId: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        displayName: getDisplayName(currentUser),
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        bio: currentUser.bio,
        joinedAt: currentUser.createdAt ?? now,
        lastReadMessageId: null,
        lastReadAt: null,
        presenceStatus: PresenceStatusEnum.Online,
      }
    : null;
  const members = currentUserMember
    ? [currentUserMember, directMember]
    : [directMember];

  return {
    id: createDraftConversationId(user.id),
    type: ConversationTypeEnum.DIRECT,
    title: userDisplayName,
    groupName: null,
    createdById: currentUser?.id ?? null,
    directUserAId: currentUser?.id ?? null,
    directUserBId: user.id,
    lastMessage: "No messages yet.",
    lastMessageAt: null,
    participantCount: members.length,
    unreadCount: 0,
    avatarUrl: user.avatarUrl ?? undefined,
    members,
    directMember,
    currentUserId: currentUser?.id,
    lastMessageId: null,
    createdAt: now,
    updatedAt: now,
  };
}
