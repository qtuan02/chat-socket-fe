export type ChatUser = {
  id: string;
  displayName: string;
  isOnline: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  participantCount: number;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
};
