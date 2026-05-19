const DRAFT_CONVERSATION_ID_PREFIX = "draft:";

export function createDraftConversationId(userId: string) {
  return `${DRAFT_CONVERSATION_ID_PREFIX}${userId}`;
}

export function isDraftConversationId(conversationId: string) {
  return conversationId.startsWith(DRAFT_CONVERSATION_ID_PREFIX);
}
