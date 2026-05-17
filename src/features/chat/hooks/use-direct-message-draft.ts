import * as React from "react";
import { useLocation, useNavigate } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { useSocketStore } from "@/stores/useSocketStore";
import type { Conversation, ConversationMember } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import type { Friend } from "@/types/friend";
import type { MessageDto } from "@/types/message";
import type { User } from "@/types/user";
import { PresenceStatusEnum } from "@/types/user";
import { getDisplayName } from "@/utils/display";

type ChatLocationState = {
  directMessageDraftFriend?: Friend | null;
};

type UseDirectMessageDraftParams = {
  activeConversation?: Conversation;
  conversationId: string;
  isChatHomeRoute: boolean;
  isFriendsRoute: boolean;
  isProfileRoute: boolean;
  onCloseDetails: () => void;
};

function getDraftFriendFromLocationState(state: unknown) {
  if (!state || typeof state !== "object") return null;

  const directMessageDraftFriend = (state as ChatLocationState)
    .directMessageDraftFriend;

  if (
    !directMessageDraftFriend ||
    typeof directMessageDraftFriend.id !== "string" ||
    typeof directMessageDraftFriend.displayName !== "string"
  )
    return null;

  return directMessageDraftFriend;
}

function createDirectMessageDraftConversation({
  currentUser,
  friend,
  presenceStatus,
}: {
  currentUser?: User;
  friend: Friend;
  presenceStatus: PresenceStatusEnum;
}): Conversation {
  const now = new Date().toISOString();
  const friendMember: ConversationMember = {
    id: friend.id,
    userId: friend.id,
    firstName: friend.firstName ?? "",
    lastName: friend.lastName ?? "",
    displayName: friend.displayName,
    username: friend.username,
    avatarUrl: friend.avatarUrl,
    bio: friend.bio,
    joinedAt: friend.joinedAt,
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
    ? [currentUserMember, friendMember]
    : [friendMember];

  return {
    id: `draft:${friend.id}`,
    type: ConversationTypeEnum.DIRECT,
    title: friend.displayName,
    lastMessage: "No messages yet.",
    lastMessageAt: "No messages yet.",
    participantCount: members.length,
    unreadCount: 0,
    avatarUrl: friend.avatarUrl,
    members,
    directMember: friendMember,
    currentUserId: currentUser?.id,
    lastMessageId: null,
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
  const locationDraftFriend = React.useMemo(
    () => getDraftFriendFromLocationState(location.state),
    [location.state],
  );
  const [draftFriend, setDraftFriend] = React.useState<Friend | null>(
    () => locationDraftFriend,
  );

  const draftConversation = React.useMemo(() => {
    if (!draftFriend) return null;

    const presenceStatus = onlineUsers.includes(draftFriend.id)
      ? PresenceStatusEnum.Online
      : PresenceStatusEnum.Offline;

    return createDirectMessageDraftConversation({
      currentUser,
      friend: draftFriend,
      presenceStatus,
    });
  }, [currentUser, draftFriend, onlineUsers]);
  const isDraftConversation = isChatHomeRoute && !!draftConversation;

  React.useEffect(() => {
    if (!locationDraftFriend) return;

    setDraftFriend(locationDraftFriend);
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
    locationDraftFriend,
    navigate,
  ]);

  React.useEffect(() => {
    if (isFriendsRoute || isProfileRoute) {
      setDraftFriend(null);
      onCloseDetails();
      return;
    }

    if (
      !draftFriend ||
      !activeConversation ||
      activeConversation.id !== conversationId ||
      activeConversation.type !== ConversationTypeEnum.DIRECT ||
      activeConversation.directMember?.userId !== draftFriend.id
    )
      return;

    setDraftFriend(null);
  }, [
    activeConversation,
    conversationId,
    draftFriend,
    isFriendsRoute,
    isProfileRoute,
    onCloseDetails,
  ]);

  const clearDraftConversation = React.useCallback(() => {
    setDraftFriend(null);
  }, []);

  const openDraftConversation = React.useCallback(
    (friend: Friend) => {
      setDraftFriend(friend);
      onCloseDetails();

      if (location.pathname !== APP_ROUTES.chat) {
        navigate(APP_ROUTES.chat, {
          state: { directMessageDraftFriend: friend },
        });
      }
    },
    [location.pathname, navigate, onCloseDetails],
  );

  const handleDraftMessageSent = React.useCallback(
    (message: MessageDto) => {
      onCloseDetails();
      navigate(APP_ROUTES.conversationById(message.conversationId));
    },
    [navigate, onCloseDetails],
  );

  return {
    clearDraftConversation,
    draftConversation,
    handleDraftMessageSent,
    isDraftConversation,
    openDraftConversation,
  };
}
