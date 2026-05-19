import * as React from "react";
import { useLocation, useNavigate } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { useSocketStore } from "@/stores/useSocketStore";
import type { Conversation, ConversationMember } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import type { MessageRecord } from "@/types/message";
import type { DirectMessageUser, User } from "@/types/user";
import { PresenceStatusEnum } from "@/types/user";
import { createDraftConversationId } from "@/utils/conversation";
import { getDisplayName } from "@/utils/display";

type UseDirectMessageDraftParams = {
  activeConversation?: Conversation;
  conversationId: string;
  isChatHomeRoute: boolean;
  isFriendsRoute: boolean;
  isProfileRoute: boolean;
  onCloseDetails: () => void;
};

function isDirectMessageUser(value: unknown): value is DirectMessageUser {
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

function getDraftUserFromLocationState(state: unknown) {
  if (!isRecord(state)) return null;

  const locationState = state;
  const draftUser = locationState.directMessageDraftUser;

  return isDirectMessageUser(draftUser) ? draftUser : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function createDirectMessageDraftConversation({
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

export function useDirectMessageDraft({
  activeConversation,
  conversationId,
  isChatHomeRoute,
  isFriendsRoute,
  isProfileRoute,
  onCloseDetails,
}: UseDirectMessageDraftParams) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUserQuery();
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const locationDraftUser = React.useMemo(
    () => getDraftUserFromLocationState(location.state),
    [location.state],
  );
  const [draftUser, setDraftUser] = React.useState<DirectMessageUser | null>(
    () => locationDraftUser,
  );
  const [sentDraftConversation, setSentDraftConversation] =
    React.useState<Conversation | null>(null);

  const draftConversation = React.useMemo(() => {
    if (!draftUser) return null;

    const presenceStatus = onlineUsers.includes(draftUser.id)
      ? PresenceStatusEnum.Online
      : PresenceStatusEnum.Offline;

    return createDirectMessageDraftConversation({
      currentUser,
      user: draftUser,
      presenceStatus,
    });
  }, [currentUser, draftUser, onlineUsers]);
  const isDraftConversation = isChatHomeRoute && !!draftConversation;

  React.useEffect(() => {
    if (!locationDraftUser) return;

    setDraftUser(locationDraftUser);
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      { replace: true, state: null },
    );
  }, [
    location.hash,
    location.pathname,
    location.search,
    locationDraftUser,
    navigate,
  ]);

  React.useEffect(() => {
    if (isFriendsRoute || isProfileRoute) {
      setDraftUser(null);
      setSentDraftConversation(null);
      onCloseDetails();
      return;
    }

    if (
      sentDraftConversation &&
      activeConversation?.id === sentDraftConversation.id
    ) {
      setSentDraftConversation(null);
    }

    if (
      !draftUser ||
      !activeConversation ||
      activeConversation.id !== conversationId ||
      activeConversation.type !== ConversationTypeEnum.DIRECT ||
      activeConversation.directMember?.userId !== draftUser.id
    )
      return;

    setDraftUser(null);
  }, [
    activeConversation,
    conversationId,
    draftUser,
    isFriendsRoute,
    isProfileRoute,
    onCloseDetails,
    sentDraftConversation,
  ]);

  const clearDraftConversation = React.useCallback(() => {
    setDraftUser(null);
    setSentDraftConversation(null);
  }, []);

  const openDraftConversation = React.useCallback(
    (user: DirectMessageUser) => {
      setDraftUser(user);
      onCloseDetails();

      if (location.pathname !== APP_ROUTES.chat) {
        navigate(APP_ROUTES.chat, {
          state: { directMessageDraftUser: user },
        });
      }
    },
    [location.pathname, navigate, onCloseDetails],
  );

  const handleDraftMessageSent = React.useCallback(
    (message: MessageRecord) => {
      if (draftConversation) {
        setSentDraftConversation({
          ...draftConversation,
          id: message.conversationId,
          lastMessage: message.content.trim() || "No messages yet.",
          lastMessageAt: message.createdAt,
          lastMessageId: message.id,
          lastMessageSenderId: message.senderId,
          updatedAt: message.updatedAt,
        });
      }

      setDraftUser(null);
      onCloseDetails();
      navigate(APP_ROUTES.conversationById(message.conversationId));
    },
    [draftConversation, navigate, onCloseDetails],
  );

  return {
    clearDraftConversation,
    draftConversation,
    handleDraftMessageSent,
    isDraftConversation,
    openDraftConversation,
    sentDraftConversation,
  };
}
