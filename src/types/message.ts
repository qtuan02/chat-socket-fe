import type { BaseResponse } from "./base";
import type { ConversationMember } from "./conversation";

export enum MessageTypeEnum {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  SYSTEM = "SYSTEM",
}

export enum MessageStatus {
  Sending = "sending",
  Sent = "sent",
  Failed = "failed",
}

export const messageStatusLabels: Record<MessageStatus, string> = {
  [MessageStatus.Sending]: "Sending",
  [MessageStatus.Sent]: "Sent",
  [MessageStatus.Failed]: "Failed",
};

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string | null;
  type: MessageTypeEnum;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  clientMessageId?: string;
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachmentUrl?: string | null;
  type: MessageTypeEnum;
  messageStatus: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GetMessagesParams {
  conversationId: string;
  limit?: number;
  cursor?: string;
}

export interface SendDirectMessageRequest {
  content: string;
  recipientId: string;
  type: MessageTypeEnum.TEXT;
  attachmentUrl: null;
}

export interface SendGroupMessageRequest {
  content: string;
  conversationId: string;
  type: MessageTypeEnum.TEXT;
  attachmentUrl: null;
}

export interface MessagePage {
  items: MessageDto[];
  nextCursor: string | null;
}

export type MessagePageResponse = BaseResponse<{
  messages: MessageDto[];
  nextCursor: string | null;
}>;

export type MessageResponse = BaseResponse<MessageDto>;

type MessageSender = Pick<ConversationMember, "userId" | "displayName">;

export type UseMessagesInfiniteQueryParams = Omit<
  GetMessagesParams,
  "cursor"
> & {
  enabled?: boolean;
  limit?: number;
  members: MessageSender[];
};
