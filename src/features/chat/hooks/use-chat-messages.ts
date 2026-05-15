import * as React from "react";
import {
  MESSAGES_DEFAULT_LIMIT,
  useMessagesInfiniteQuery,
} from "@/hooks/api/message";
import type { Conversation } from "@/types/conversation";
import type { Message, MessageDto, MessagePage } from "@/types/message";

const MESSAGE_LIST_FIRST_ITEM_INDEX = 1_000_000;

function mapMessageToUiModel(
  message: MessageDto,
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
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

function getOlderMessageCount(pages: Array<MessagePage> | undefined) {
  return (
    pages?.slice(1).reduce((count, page) => count + page.items.length, 0) ?? 0
  );
}

export function useChatMessages(conversation: Conversation) {
  const query = useMessagesInfiniteQuery({
    conversationId: conversation.id,
    limit: MESSAGES_DEFAULT_LIMIT,
  });

  const senderNameById = React.useMemo(() => {
    return new Map(
      conversation.members.map((member) => [member.userId, member.displayName]),
    );
  }, [conversation.members]);

  const messages = React.useMemo(() => {
    const orderedPages = [...(query.data?.pages ?? [])].reverse();

    return orderedPages.flatMap((page) =>
      page.items.map((message) => mapMessageToUiModel(message, senderNameById)),
    );
  }, [query.data?.pages, senderNameById]);

  const firstItemIndex =
    MESSAGE_LIST_FIRST_ITEM_INDEX - getOlderMessageCount(query.data?.pages);

  return {
    ...query,
    firstItemIndex,
    messages: messages.reverse(),
  };
}
