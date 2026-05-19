import type { SOCKET_EVENT } from "@/config/constant";
import type { BaseResponse } from "./base";
import type { MessageRecord } from "./message";
import type { PresenceStatusEnum } from "./user";

export enum ParticipantRole {
  Admin = "ADMIN",
  Member = "MEMBER",
}

export const participantRoleLabels: Record<ParticipantRole, string> = {
  [ParticipantRole.Admin]: "Admin",
  [ParticipantRole.Member]: "Member",
};

export enum ConversationTypeEnum {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
}

type ConversationParticipantIdentity = Pick<
  ConversationParticipant,
  | "userId"
  | "username"
  | "firstName"
  | "lastName"
  | "avatarUrl"
  | "bio"
  | "joinedAt"
  | "lastReadMessageId"
  | "lastReadAt"
>;

interface ConversationParticipant {
  userId: string;
  username?: string | null;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string;
  role: ParticipantRole;
  joinedAt: string;
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
}

export interface ConversationRecord {
  id: string;
  type: ConversationTypeEnum;
  groupName: string | null;
  createdById: string | null;
  directUserAId: string | null;
  directUserBId: string | null;
  lastMessageId: string | null;
  lastMessage: MessageRecord | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  participants: ConversationParticipant[];
}

export interface ConversationMember extends ConversationParticipantIdentity {
  id: string;
  displayName: string;
  bio?: string;
  presenceStatus: PresenceStatusEnum;
  role?: ParticipantRole;
  lastActiveAt?: string;
}

export interface Conversation {
  id: string;
  type: ConversationTypeEnum;
  title: string;
  groupName: string | null;
  createdById: string | null;
  directUserAId: string | null;
  directUserBId: string | null;
  lastMessage: string;
  lastMessageAt: string | null;
  lastMessageSenderId?: string;
  lastMessageSenderName?: string;
  participantCount: number;
  unreadCount: number;
  avatarUrl?: string;
  members: ConversationMember[];
  directMember?: ConversationMember;
  currentUserId?: string;
  lastMessageId: string | null;
  onlineUsersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationEvent {
  eventType: typeof SOCKET_EVENT.CONVERSATION_UPDATED;
  conversationId: string;
  lastMessage: MessageRecord | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ConversationSeenEvent {
  eventType: typeof SOCKET_EVENT.CONVERSATION_SEEN;
  conversationId: string;
  seenByUserId: string;
  lastReadMessageId: string;
  lastReadAt: string;
}

export interface GetConversationsParams {
  limit?: number;
  cursor?: string;
  type?: ConversationTypeEnum;
}

export interface ConversationPage {
  items: ConversationRecord[];
  nextCursor: string | null;
}

export type CreateGroupConversationRequest = {
  type: "GROUP";
  name: string;
  memberIds: string[];
};

export type UpdateGroupRequest = {
  name: string;
};

export type GroupMembersRequest = {
  memberIds: string[];
};

type ConversationMutationResponse = BaseResponse<ConversationRecord>;

export type CreateGroupConversationResponse = ConversationMutationResponse;
export type UpdateGroupResponse = ConversationMutationResponse;
export type AddGroupMembersResponse = ConversationMutationResponse;
export type RemoveGroupMemberResponse = ConversationMutationResponse;
export type LeaveGroupResponse = BaseResponse<null>;

export type ConversationPageResponse = BaseResponse<{
  messages: ConversationRecord[];
  nextCursor: string | null;
}>;
