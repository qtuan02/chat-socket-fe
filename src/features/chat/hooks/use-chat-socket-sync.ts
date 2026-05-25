import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SOCKET_EVENT } from "@/config/constant";
import {
  applyConversationSeenToCache,
  applyConversationUpdateToCache,
  useMarkConversationAsSeenMutation,
} from "@/hooks/api/conversation";
import { appendConversationMessageToCache } from "@/hooks/api/message";
import { useCurrentUserQuery } from "@/hooks/api/user";
import {
  subscribeToConversationMessages,
  subscribeToConversationSeen,
  subscribeToConversationUpdates,
} from "@/services/socket-service";
import { useSocketStore } from "@/stores/useSocketStore";
import type { ConversationEvent } from "@/types/conversation";

type UseChatSocketSyncParams = {
  activeConversationId: string;
};

function isMessageFromOtherUser(senderId?: string, currentUserId?: string) {
  return !!currentUserId && !!senderId && senderId !== currentUserId;
}

function shouldClearActiveConversationUnreadCount(
  event: ConversationEvent,
  activeConversationId: string,
  currentUserId?: string,
) {
  return (
    event.conversationId === activeConversationId &&
    isMessageFromOtherUser(event.lastMessage?.senderId, currentUserId)
  );
}

export function useChatSocketSync({
  activeConversationId,
}: UseChatSocketSyncParams) {
  const queryClient = useQueryClient();
  const client = useSocketStore((state) => state.client);
  const isConnected = useSocketStore((state) => state.isConnected);
  const { data: currentUser } = useCurrentUserQuery();
  const currentUserId = currentUser?.id;
  const { mutate: markConversationAsSeen } =
    useMarkConversationAsSeenMutation();

  useEffect(() => {
    if (!client || !isConnected) return;

    return subscribeToConversationUpdates(client, (event) => {
      if (event.eventType === SOCKET_EVENT.CONVERSATION_SEEN) {
        applyConversationSeenToCache(queryClient, event, currentUserId);
        return;
      }

      if (event.lastMessage) {
        appendConversationMessageToCache(queryClient, event.lastMessage);
      }

      applyConversationUpdateToCache(queryClient, event, {
        refetchMissingConversation:
          event.conversationId !== activeConversationId,
        unreadCount: shouldClearActiveConversationUnreadCount(
          event,
          activeConversationId,
          currentUserId,
        )
          ? 0
          : undefined,
      });
    });
  }, [activeConversationId, client, currentUserId, isConnected, queryClient]);

  useEffect(() => {
    if (!client || !isConnected || !activeConversationId) return;

    const unsubscribeMessages = subscribeToConversationMessages(
      client,
      activeConversationId,
      (message) => {
        appendConversationMessageToCache(queryClient, message, {
          userId: currentUserId,
        });

        if (isMessageFromOtherUser(message.senderId, currentUserId))
          markConversationAsSeen(message.conversationId);
      },
    );
    const unsubscribeSeen = subscribeToConversationSeen(
      client,
      activeConversationId,
      (event) => {
        applyConversationSeenToCache(queryClient, event, currentUserId);
      },
    );

    return () => {
      unsubscribeMessages();
      unsubscribeSeen();
    };
  }, [
    activeConversationId,
    client,
    currentUserId,
    isConnected,
    markConversationAsSeen,
    queryClient,
  ]);
}
