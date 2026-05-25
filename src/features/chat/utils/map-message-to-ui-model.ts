import type { Message, MessageRecord } from "@/types/message";
import { MessageStatus } from "@/types/message";

export function mapMessageToUiModel(
  message: MessageRecord,
  senderNameById: Map<string, string>,
): Message {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderName: senderNameById.get(message.senderId) ?? "Unknown user",
    content: message.content,
    attachmentUrl: message.attachmentUrl ?? null,
    type: message.type,
    messageStatus: MessageStatus.Sent,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}
