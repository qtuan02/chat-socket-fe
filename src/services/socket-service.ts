import type { Client, IMessage } from "@stomp/stompjs";
import { SOCKET_EVENT } from "@/config/constant";
import type {
  ConversationEvent,
  ConversationSeenEvent,
} from "@/types/conversation";
import type { MessageRecord } from "@/types/message";
import { parseToJson } from "@/utils/string";

const socketDestinations = {
  conversationUpdates: "/user/queue/conversations",
  conversationMessages: (conversationId: string) =>
    `/topic/conversations/${conversationId}/messages`,
  conversationSeen: (conversationId: string) =>
    `/topic/conversations/${conversationId}/seen`,
} as const;

export function subscribeToConversationUpdates(
  client: Client,
  onConversationUpdate: (
    event: ConversationEvent | ConversationSeenEvent,
  ) => void,
) {
  const subscription = client.subscribe(
    socketDestinations.conversationUpdates,
    (message: IMessage) => {
      const event = parseToJson<ConversationEvent | ConversationSeenEvent>(
        message.body,
      );

      if (
        !event ||
        (event.eventType !== SOCKET_EVENT.CONVERSATION_UPDATED &&
          event.eventType !== SOCKET_EVENT.CONVERSATION_SEEN)
      )
        return;

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
  onMessage: (message: MessageRecord) => void,
) {
  const subscription = client.subscribe(
    socketDestinations.conversationMessages(conversationId),
    (message: IMessage) => {
      const incomingMessage = parseToJson<MessageRecord>(message.body);

      if (!incomingMessage) return;

      onMessage(incomingMessage);
    },
  );

  return () => {
    subscription.unsubscribe();
  };
}

export function subscribeToConversationSeen(
  client: Client,
  conversationId: string,
  onConversationSeen: (event: ConversationSeenEvent) => void,
) {
  const subscription = client.subscribe(
    socketDestinations.conversationSeen(conversationId),
    (message: IMessage) => {
      const event = parseToJson<ConversationSeenEvent>(message.body);

      if (!event || event.eventType !== SOCKET_EVENT.CONVERSATION_SEEN) return;

      onConversationSeen(event);
    },
  );

  return () => {
    subscription.unsubscribe();
  };
}
