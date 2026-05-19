import type { Client, IMessage } from "@stomp/stompjs";
import { SOCKET_EVENT } from "@/config/constant";
import type {
  ConversationEvent,
  ConversationSeenEvent,
} from "@/types/conversation";
import { type MessageRecord, MessageTypeEnum } from "@/types/message";
import { parseToJson } from "@/utils/string";

const socketDestinations = {
  conversationUpdates: "/user/queue/conversations",
  conversationMessages: (conversationId: string) =>
    `/topic/conversations/${conversationId}/messages`,
  conversationSeen: (conversationId: string) =>
    `/topic/conversations/${conversationId}/seen`,
} as const;

const messageTypes = new Set<string>(Object.values(MessageTypeEnum));

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function isMessageRecord(value: unknown): value is MessageRecord {
  if (!isRecord(value)) return false;

  const hasValidAttachmentUrl =
    value.attachmentUrl === undefined ||
    value.attachmentUrl === null ||
    typeof value.attachmentUrl === "string";

  return (
    typeof value.id === "string" &&
    typeof value.conversationId === "string" &&
    typeof value.senderId === "string" &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    typeof value.type === "string" &&
    messageTypes.has(value.type) &&
    hasValidAttachmentUrl
  );
}

function isConversationUpdatedEvent(
  value: unknown,
): value is ConversationEvent {
  if (!isRecord(value)) return false;

  const hasValidLastMessage =
    value.lastMessage === null || isMessageRecord(value.lastMessage);

  return (
    value.eventType === SOCKET_EVENT.CONVERSATION_UPDATED &&
    typeof value.conversationId === "string" &&
    typeof value.lastMessageAt === "string" &&
    typeof value.unreadCount === "number" &&
    Number.isFinite(value.unreadCount) &&
    hasValidLastMessage
  );
}

function isConversationSeenEvent(
  value: unknown,
): value is ConversationSeenEvent {
  if (!isRecord(value)) return false;

  return (
    value.eventType === SOCKET_EVENT.CONVERSATION_SEEN &&
    typeof value.conversationId === "string" &&
    typeof value.seenByUserId === "string" &&
    typeof value.lastReadMessageId === "string" &&
    typeof value.lastReadAt === "string"
  );
}

export function subscribeToConversationUpdates(
  client: Client,
  onConversationUpdate: (
    event: ConversationEvent | ConversationSeenEvent,
  ) => void,
) {
  const subscription = client.subscribe(
    socketDestinations.conversationUpdates,
    (message: IMessage) => {
      const payload = parseToJson<unknown>(message.body);
      if (
        !isConversationUpdatedEvent(payload) &&
        !isConversationSeenEvent(payload)
      )
        return;

      onConversationUpdate(payload);
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
      const payload = parseToJson<unknown>(message.body);
      if (!isMessageRecord(payload)) return;
      if (payload.conversationId !== conversationId) return;
      onMessage(payload);
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
      const payload = parseToJson<unknown>(message.body);
      if (!isConversationSeenEvent(payload)) return;
      if (payload.conversationId !== conversationId) return;
      onConversationSeen(payload);
    },
  );

  return () => {
    subscription.unsubscribe();
  };
}
