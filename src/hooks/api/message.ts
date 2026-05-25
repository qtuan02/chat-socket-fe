import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { MESSAGES_DEFAULT_LIMIT } from "@/config/constant";
import { conversationQueryKeys } from "@/hooks/api/conversation";
import { useCurrentUserQuery } from "@/hooks/api/user";
import {
  queryKeysFactory,
  type UseMutationOptionsWrapper,
} from "@/libs/query-key-factory";
import { messageService } from "@/services/message-service";
import { useSocketStore } from "@/stores/useSocketStore";
import type {
  MessagePage,
  MessageRecord,
  SendDirectMessageRequest,
  SendGroupMessageRequest,
  UseMessagesInfiniteQueryParams,
} from "@/types/message";
import { isDraftConversationId } from "@/utils/conversation";

const messageQueryKeyFactory = queryKeysFactory<"message">("message");
const INITIAL_CURSOR_PAGE_PARAM: string | undefined = undefined;

type MessageInfiniteData = InfiniteData<MessagePage, string | undefined>;

export const messageQueryKeys = {
  ...messageQueryKeyFactory,
  conversation: (conversationId: string) =>
    messageQueryKeyFactory.detail(conversationId),
  messages: (userId: string, conversationId: string, limit = 50) =>
    messageQueryKeyFactory.detail(conversationId, { userId, limit }),
};

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
    initialPageParam: INITIAL_CURSOR_PAGE_PARAM,
    enabled: canFetchMessages,
  });

  return query;
}

export function useSendDirectMessageMutation(
  options?: UseMutationOptionsWrapper<
    SendDirectMessageRequest,
    MessageRecord,
    Error
  >,
) {
  return useSendMessageMutation(messageService.sendDirectMessage, options);
}

export function useSendGroupMessageMutation(
  options?: UseMutationOptionsWrapper<
    SendGroupMessageRequest,
    MessageRecord,
    Error
  >,
) {
  return useSendMessageMutation(messageService.sendGroupMessage, options);
}

function useSendMessageMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<MessageRecord>,
  options?: UseMutationOptionsWrapper<TVariables, MessageRecord, Error>,
) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUserQuery();
  const isSocketConnected = useSocketStore((state) => state.isConnected);

  return useMutation<MessageRecord, Error, TVariables>({
    mutationFn,
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
