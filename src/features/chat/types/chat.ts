export type ChatUser = {
  id: string;
  displayName: string;
  isOnline: boolean;
};

export type ConversationKind = "group" | "direct";

export type ConversationFilter = "all" | "groups" | "direct";

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
};

export type ConversationMember = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isOnline?: boolean;
  role?: string;
};

export type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  participantCount: number;
  unreadCount: number;
  kind: ConversationKind;
  avatarUrl?: string;
  onlineUsersCount?: number;
  statusText?: string;
  members?: ConversationMember[];
};
