import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as React from "react";
import {
  MESSAGE_LIST_FIRST_ITEM_INDEX,
  MESSAGES_DEFAULT_LIMIT,
} from "@/config/constant";
import { conversationQueryKeys } from "@/hooks/api/conversation";
import { useCurrentUserQuery } from "@/hooks/api/user";
import {
  queryKeysFactory,
  type UseMutationOptionsWrapper,
} from "@/libs/query-key-factory";
import { messageService } from "@/services/message-service";
import { useSocketStore } from "@/stores/useSocketStore";
import type {
  Message,
  MessagePage,
  MessageRecord,
  SendDirectMessageRequest,
  SendGroupMessageRequest,
  UseMessagesInfiniteQueryParams,
} from "@/types/message";
import { MessageStatus } from "@/types/message";
import { isDraftConversationId } from "@/utils/conversation";

const messageQueryKeyFactory = queryKeysFactory<"message">("message");

type MessageInfiniteData = InfiniteData<MessagePage, string | undefined>;

export const messageQueryKeys = {
  ...messageQueryKeyFactory,
  conversation: (conversationId: string) =>
    messageQueryKeyFactory.detail(conversationId),
  messages: (userId: string, conversationId: string, limit = 50) =>
    messageQueryKeyFactory.detail(conversationId, { userId, limit }),
};

function mapMessageToUiModel(
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

function appendMessageToInfiniteData(
  data: MessageInfiniteData | undefined,
  message: MessageRecord,
): MessageInfiniteData | undefined {
  if (!data) return data;

  const hasExistingMessage = data.pages.some((page) =>
    page.items.some((item) => item.id === message.id),
  );
  if (hasExistingMessage) return data;

  if (data.pages.length === 0) {
    return {
      ...data,
      pages: [{ items: [message], nextCursor: null }],
      pageParams: [undefined],
    };
  }

  return {
    ...data,
    pages: data.pages.map((page, index) =>
      index === 0
        ? {
            ...page,
            items: [...page.items, message],
          }
        : page,
    ),
  };
}

function upsertMessageToInfiniteData(
  data: MessageInfiniteData | undefined,
  message: MessageRecord,
): MessageInfiniteData {
  if (!data) {
    return {
      pages: [{ items: [message], nextCursor: null }],
      pageParams: [undefined],
    };
  }

  return appendMessageToInfiniteData(data, message) ?? data;
}

export function appendConversationMessageToCache(
  queryClient: QueryClient,
  message: MessageRecord,
  options: { userId?: string; limit?: number } = {},
) {
  queryClient.setQueriesData<MessageInfiniteData>(
    { queryKey: messageQueryKeys.conversation(message.conversationId) },
    (data) => appendMessageToInfiniteData(data, message),
  );

  if (!options.userId) return;

  queryClient.setQueryData<MessageInfiniteData>(
    messageQueryKeys.messages(
      options.userId,
      message.conversationId,
      options.limit ?? MESSAGES_DEFAULT_LIMIT,
    ),
    (data) => upsertMessageToInfiniteData(data, message),
  );
}

export function useMessagesInfiniteQuery({
  conversationId,
  enabled = true,
  members,
  limit = MESSAGES_DEFAULT_LIMIT,
}: UseMessagesInfiniteQueryParams) {
  const { data: currentUser } = useCurrentUserQuery();
  const canFetchMessages =
    enabled &&
    !!conversationId &&
    !!currentUser?.id &&
    !isDraftConversationId(conversationId);
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
    enabled: canFetchMessages,
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

export function useSendDirectMessageMutation(
  options?: UseMutationOptionsWrapper<
    SendDirectMessageRequest,
    MessageRecord,
    Error
  >,
) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUserQuery();
  const isSocketConnected = useSocketStore((state) => state.isConnected);

  return useMutation({
    mutationFn: messageService.sendDirectMessage,
    ...options,
    onSuccess: (message, variables, onMutateResult, context) => {
      appendConversationMessageToCache(queryClient, message, {
        userId: currentUser?.id,
      });
      if (!isSocketConnected)
        void queryClient.invalidateQueries({
          queryKey: conversationQueryKeys.lists(),
        });
      options?.onSuccess?.(message, variables, onMutateResult, context);
    },
  });
}

export function useSendGroupMessageMutation(
  options?: UseMutationOptionsWrapper<
    SendGroupMessageRequest,
    MessageRecord,
    Error
  >,
) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUserQuery();
  const isSocketConnected = useSocketStore((state) => state.isConnected);

  return useMutation({
    mutationFn: messageService.sendGroupMessage,
    ...options,
    onSuccess: (message, variables, onMutateResult, context) => {
      appendConversationMessageToCache(queryClient, message, {
        userId: currentUser?.id,
      });
      if (!isSocketConnected)
        void queryClient.invalidateQueries({
          queryKey: conversationQueryKeys.lists(),
        });
      options?.onSuccess?.(message, variables, onMutateResult, context);
    },
  });
}
