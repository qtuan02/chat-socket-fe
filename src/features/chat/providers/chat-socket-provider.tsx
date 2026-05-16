import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import {
  applyConversationSeenToCache,
  applyConversationUpdateToCache,
  useMarkConversationAsSeenMutation,
} from "@/hooks/api/conversation";
import { messageQueryKeys } from "@/hooks/api/message";
import { useCurrentUserQuery } from "@/hooks/api/user";
import {
  subscribeToConversationMessages,
  subscribeToConversationSeen,
  subscribeToConversationUpdates,
} from "@/services/socket-service";
import { useSocketStore } from "@/stores/useSocketStore";

type ChatSocketProviderProps = {
  activeConversationId: string;
  children: React.ReactNode;
};

export function ChatSocketProvider({
  activeConversationId,
  children,
}: ChatSocketProviderProps) {
  const queryClient = useQueryClient();
  const client = useSocketStore((state) => state.client);
  const isConnected = useSocketStore((state) => state.isConnected);
  const { data: currentUser } = useCurrentUserQuery();
  const { mutate: markConversationAsSeen } =
    useMarkConversationAsSeenMutation();

  React.useEffect(() => {
    if (!client || !isConnected) return;

    return subscribeToConversationUpdates(client, (event) => {
      const shouldMarkActiveConversationAsRead =
        !!event.lastMessage &&
        event.conversationId === activeConversationId &&
        !!currentUser?.id &&
        event.lastMessage.senderId !== currentUser.id;

      applyConversationUpdateToCache(queryClient, event, {
        unreadCount: shouldMarkActiveConversationAsRead ? 0 : undefined,
      });
    });
  }, [activeConversationId, client, currentUser?.id, isConnected, queryClient]);

  React.useEffect(() => {
    if (!client || !isConnected || !activeConversationId) return;

    return subscribeToConversationMessages(
      client,
      activeConversationId,
      (message) => {
        if (currentUser?.id && message.senderId === currentUser.id) {
          return;
        }

        void queryClient.invalidateQueries({
          queryKey: messageQueryKeys.conversation(message.conversationId),
        });

        if (currentUser?.id) {
          markConversationAsSeen(message.conversationId);
        }
      },
    );
  }, [
    activeConversationId,
    client,
    currentUser?.id,
    isConnected,
    markConversationAsSeen,
    queryClient,
  ]);

  React.useEffect(() => {
    if (!client || !isConnected || !activeConversationId) return;

    return subscribeToConversationSeen(
      client,
      activeConversationId,
      (event) => {
        applyConversationSeenToCache(queryClient, event, currentUser?.id);
      },
    );
  }, [activeConversationId, client, currentUser?.id, isConnected, queryClient]);

  return <>{children}</>;
}
