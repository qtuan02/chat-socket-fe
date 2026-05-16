import type { Client, IMessage } from "@stomp/stompjs";
import type { ConversationEvent } from "@/types/conversation";
import type { MessageDto } from "@/types/message";
import { parseToJson } from "@/utils/string";

const socketDestinations = {
  conversationUpdates: "/user/queue/conversations",
  conversationMessages: (conversationId: string) =>
    `/topic/conversations/${conversationId}/messages`,
} as const;

export function subscribeToConversationUpdates(
  client: Client,
  onConversationUpdate: (event: ConversationEvent) => void,
) {
  const subscription = client.subscribe(
    socketDestinations.conversationUpdates,
    (message: IMessage) => {
      const event = parseToJson<ConversationEvent>(message.body);

      if (!event || event.eventType !== "conversation.updated") return;

      onConversationUpdate(event);
    },
  );

  return () => {
    subscription.unsubscribe();
  };
}

export function subscribeToConversationMessages(
  client: Client,
  conversationId: string,
  onMessage: (message: MessageDto) => void,
) {
  const subscription = client.subscribe(
    socketDestinations.conversationMessages(conversationId),
    (message: IMessage) => {
      const incomingMessage = parseToJson<MessageDto>(message.body);

      if (!incomingMessage) return;

      onMessage(incomingMessage);
    },
  );

  return () => {
    subscription.unsubscribe();
  };
}
