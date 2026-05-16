import type { BaseResponse } from "./base";
import type { MessageDto } from "./message";

export type ParticipantRole = "ADMIN" | "MEMBER";

export enum ConversationTypeEnum {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
}

export interface ConversationParticipantDto {
  userId: string;
  username?: string | null;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: ParticipantRole;
  joinedAt: string;
}

export interface ConversationDto {
  id: string;
  type: ConversationTypeEnum;
  groupName: string | null;
  createdById: string | null;
  directUserAId: string | null;
  directUserBId: string | null;
  lastMessageId: string | null;
  lastMessage: MessageDto | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  participants: ConversationParticipantDto[];
}

export interface ConversationMember {
  userId: string;
  id: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  role?: ParticipantRole;
  joinedAt: string;
  lastActiveAt?: string;
}

export interface Conversation {
  id: string;
  type: ConversationTypeEnum;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderId?: string;
  lastMessageSenderName?: string;
  participantCount: number;
  unreadCount: number;
  avatarUrl?: string;
  members: ConversationMember[];
  directMember?: ConversationMember;
  currentUserId?: string;
  lastMessageId?: string | null;
  onlineUsersCount?: number;
  updatedAt: string;
}

export interface ConversationEvent {
  eventType: "conversation.updated";
  conversationId: string;
  lastMessage: MessageDto;
  lastMessageAt: string;
  unreadCount: number;
}

export interface GetConversationsParams {
  limit?: number;
  cursor?: string;
  type?: ConversationTypeEnum;
}

export interface ConversationPage {
  items: ConversationDto[];
  nextCursor: string | null;
}

export type ConversationPageResponse = BaseResponse<{
  messages: ConversationDto[];
  nextCursor: string | null;
}>;
