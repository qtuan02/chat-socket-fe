import { useInfiniteQuery } from "@tanstack/react-query";
import * as React from "react";
import {
  MESSAGE_LIST_FIRST_ITEM_INDEX,
  MESSAGES_DEFAULT_LIMIT,
} from "@/config/constant";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { queryKeysFactory } from "@/libs/query-key-factory";
import { messageService } from "@/services/message-service";
import type {
  Message,
  MessageDto,
  MessagePage,
  UseMessagesInfiniteQueryParams,
} from "@/types/message";
import { MessageStatus } from "@/types/message";

const messageQueryKeyFactory = queryKeysFactory<"message">("message");

export const messageQueryKeys = {
  ...messageQueryKeyFactory,
  conversation: (conversationId: string) =>
    messageQueryKeyFactory.detail(conversationId),
  messages: (userId: string, conversationId: string, limit = 50) =>
    messageQueryKeyFactory.detail(conversationId, { userId, limit }),
};

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
    messageStatus: MessageStatus.Sent,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export function useMessagesInfiniteQuery({
  conversationId,
  enabled = true,
  members,
  limit = MESSAGES_DEFAULT_LIMIT,
}: UseMessagesInfiniteQueryParams) {
  const { data: currentUser } = useCurrentUserQuery();
  const query = useInfiniteQuery<
    MessagePage,
    Error,
    {
      pages: Array<MessagePage>;
      pageParams: Array<string | undefined>;
    },
    ReturnType<typeof messageQueryKeys.messages>,
    string | undefined
  >({
    queryKey: messageQueryKeys.messages(
      currentUser?.id ?? "",
      conversationId,
      limit,
    ),
    queryFn: ({ pageParam }) =>
      messageService.getMessages({
        conversationId,
        limit,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!conversationId && !!currentUser?.id,
  });

  const senderNameById = React.useMemo(() => {
    return new Map(
      members.map((member) => [member.userId, member.displayName]),
    );
  }, [members]);

  const messages = React.useMemo(() => {
    const orderedPages = [...(query.data?.pages ?? [])].reverse();

    return orderedPages.flatMap((page) =>
      page.items.map((message) => mapMessageToUiModel(message, senderNameById)),
    );
  }, [query.data?.pages, senderNameById]);

  const olderMessageCount =
    query.data?.pages
      .slice(1)
      .reduce((count, page) => count + page.items.length, 0) ?? 0;
  const firstItemIndex = MESSAGE_LIST_FIRST_ITEM_INDEX - olderMessageCount;

  return {
    ...query,
    firstItemIndex,
    messages,
  };
}
