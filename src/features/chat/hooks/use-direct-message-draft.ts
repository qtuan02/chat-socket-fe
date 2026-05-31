import * as React from "react";
import { useLocation, useNavigate } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import {
  createDirectMessageDraftConversation,
  getDraftUserFromLocationState,
  getPendingConversationFromLocationState,
} from "@/features/chat/utils/direct-message-draft";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { useSocketStore } from "@/stores/useSocketStore";
import type { Conversation } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import type { MessageRecord } from "@/types/message";
import type { DirectMessageUser } from "@/types/user";
import { PresenceStatusEnum } from "@/types/user";

type UseDirectMessageDraftParams = {
  activeConversation?: Conversation;
  conversationId: string;
  isChatHomeRoute: boolean;
  isFriendsRoute: boolean;
  isProfileRoute: boolean;
  onCloseDetails: () => void;
};

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
  const locationPendingConversation = React.useMemo(
    () => getPendingConversationFromLocationState(location.state),
    [location.state],
  );

  const [draftUser, setDraftUser] = React.useState<DirectMessageUser | null>(
    () => locationDraftUser,
  );
  const [sentDraftConversation, setSentDraftConversation] =
    React.useState<Conversation | null>(() => locationPendingConversation);

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
    if (!locationDraftUser && !locationPendingConversation) return;

    if (locationDraftUser) {
      setDraftUser(locationDraftUser);
    }

    if (locationPendingConversation) {
      setSentDraftConversation(locationPendingConversation);
    }

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
    locationPendingConversation,
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
    ) {
      return;
    }

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
      const pendingConversation = draftConversation
        ? {
            ...draftConversation,
            id: message.conversationId,
            lastMessage: message.content.trim() || "No messages yet.",
            lastMessageAt: message.createdAt,
            lastMessageId: message.id,
            lastMessageSenderId: message.senderId,
            updatedAt: message.updatedAt,
          }
        : null;

      if (pendingConversation) {
        setSentDraftConversation(pendingConversation);
      }

      setDraftUser(null);
      onCloseDetails();
      navigate(APP_ROUTES.conversationById(message.conversationId), {
        state: pendingConversation ? { pendingConversation } : undefined,
      });
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
