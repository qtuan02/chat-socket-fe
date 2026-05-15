import type { BaseResponse } from "./base";

export enum MessageTypeEnum {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  SYSTEM = "SYSTEM",
}

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
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachmentUrl?: string | null;
  type: MessageTypeEnum;
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
  conversationId: string;
  type: MessageTypeEnum.TEXT;
  attachmentUrl: null;
  recipientId?: string | null;
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
