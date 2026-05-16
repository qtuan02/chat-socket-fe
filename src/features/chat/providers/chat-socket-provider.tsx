import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { conversationQueryKeys } from "@/hooks/api/conversation";
import { messageQueryKeys } from "@/hooks/api/message";
import {
  subscribeToConversationMessages,
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

  React.useEffect(() => {
    if (!client || !isConnected) return;

    return subscribeToConversationUpdates(client, () => {
      void queryClient.invalidateQueries({
        queryKey: conversationQueryKeys.all,
      });
    });
  }, [client, isConnected, queryClient]);

  React.useEffect(() => {
    if (!client || !isConnected || !activeConversationId) return;

    return subscribeToConversationMessages(
      client,
      activeConversationId,
      (message) => {
        void queryClient.invalidateQueries({
          queryKey: messageQueryKeys.messages(message.conversationId),
        });
        void queryClient.invalidateQueries({
          queryKey: conversationQueryKeys.all,
        });
      },
    );
  }, [activeConversationId, client, isConnected, queryClient]);

  return <>{children}</>;
}
