import { toast } from "sonner";
import { create } from "zustand";
import { messageService } from "@/services/message-service";
import {
  type Message,
  type MessageDto,
  MessageStatus,
  MessageTypeEnum,
  type SendDirectMessageRequest,
  type SendGroupMessageRequest,
} from "@/types/message";

type SendChatMessageInput = {
  conversationId: string;
  content: string;
  senderId: string;
};

type SendDirectChatMessageInput = SendChatMessageInput & {
  recipientId: string;
};

interface ChatStore {
  isSending: boolean;
  pendingMessagesByConversationId: Record<string, Message[]>;
  sendDirectMessage: (input: SendDirectChatMessageInput) => Promise<MessageDto>;
  sendGroupMessage: (input: SendChatMessageInput) => Promise<MessageDto>;
}

function createClientMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createPendingMessage({
  conversationId,
  content,
  senderId,
}: SendChatMessageInput): Message {
  const now = new Date().toISOString();
  const clientMessageId = createClientMessageId();

  return {
    clientMessageId,
    id: clientMessageId,
    conversationId,
    senderId,
    senderName: "You",
    content,
    attachmentUrl: null,
    type: MessageTypeEnum.TEXT,
    messageStatus: MessageStatus.Sending,
    createdAt: now,
    updatedAt: now,
  };
}

function toSentMessage(message: MessageDto): Message {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderName: "You",
    content: message.content,
    attachmentUrl: message.attachmentUrl ?? null,
    type: message.type,
    messageStatus: MessageStatus.Sent,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

function appendPendingMessage(
  pendingMessagesByConversationId: Record<string, Message[]>,
  message: Message,
) {
  const pendingMessages =
    pendingMessagesByConversationId[message.conversationId] ?? [];

  return {
    ...pendingMessagesByConversationId,
    [message.conversationId]: [...pendingMessages, message],
  };
}

function updatePendingMessage(
  pendingMessagesByConversationId: Record<string, Message[]>,
  conversationId: string,
  clientMessageId: string,
  updater: (message: Message) => Message,
) {
  return {
    ...pendingMessagesByConversationId,
    [conversationId]: (
      pendingMessagesByConversationId[conversationId] ?? []
    ).map((message) =>
      message.clientMessageId === clientMessageId ? updater(message) : message,
    ),
  };
}

export const useChatStore = create<ChatStore>((set) => ({
  isSending: false,
  pendingMessagesByConversationId: {},

  sendDirectMessage: async ({
    conversationId,
    content,
    recipientId,
    senderId,
  }) => {
    const pendingMessage = createPendingMessage({
      conversationId,
      content,
      senderId,
    });
    const payload = {
      recipientId,
      content,
      type: MessageTypeEnum.TEXT,
      attachmentUrl: null,
    } satisfies SendDirectMessageRequest;

    set((state) => ({
      isSending: true,
      pendingMessagesByConversationId: appendPendingMessage(
        state.pendingMessagesByConversationId,
        pendingMessage,
      ),
    }));

    try {
      const message = await messageService.sendDirectMessage(payload);

      set((state) => ({
        pendingMessagesByConversationId: updatePendingMessage(
          state.pendingMessagesByConversationId,
          conversationId,
          pendingMessage.clientMessageId ?? pendingMessage.id,
          () => ({
            ...toSentMessage(message),
            clientMessageId: pendingMessage.clientMessageId,
          }),
        ),
      }));

      return message;
    } catch (error) {
      set((state) => ({
        pendingMessagesByConversationId: updatePendingMessage(
          state.pendingMessagesByConversationId,
          conversationId,
          pendingMessage.clientMessageId ?? pendingMessage.id,
          (message) => ({
            ...message,
            messageStatus: MessageStatus.Failed,
          }),
        ),
      }));
      toast.error((error as Error)?.message || "Unable to send message.");
      throw error;
    } finally {
      set({ isSending: false });
    }
  },

  sendGroupMessage: async ({ conversationId, content, senderId }) => {
    const pendingMessage = createPendingMessage({
      conversationId,
      content,
      senderId,
    });
    const payload = {
      conversationId,
      content,
      type: MessageTypeEnum.TEXT,
      attachmentUrl: null,
    } satisfies SendGroupMessageRequest;

    set((state) => ({
      isSending: true,
      pendingMessagesByConversationId: appendPendingMessage(
        state.pendingMessagesByConversationId,
        pendingMessage,
      ),
    }));

    try {
      const message = await messageService.sendGroupMessage(payload);

      set((state) => ({
        pendingMessagesByConversationId: updatePendingMessage(
          state.pendingMessagesByConversationId,
          conversationId,
          pendingMessage.clientMessageId ?? pendingMessage.id,
          () => ({
            ...toSentMessage(message),
            clientMessageId: pendingMessage.clientMessageId,
          }),
        ),
      }));

      return message;
    } catch (error) {
      set((state) => ({
        pendingMessagesByConversationId: updatePendingMessage(
          state.pendingMessagesByConversationId,
          conversationId,
          pendingMessage.clientMessageId ?? pendingMessage.id,
          (message) => ({
            ...message,
            messageStatus: MessageStatus.Failed,
          }),
        ),
      }));
      toast.error((error as Error)?.message || "Unable to send message.");
      throw error;
    } finally {
      set({ isSending: false });
    }
  },
}));
