import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeysFactory } from "@/libs/query-key-factory";
import { conversationService } from "@/services/conversation-service";
import type {
  ConversationPage,
  ConversationTypeEnum,
  GetConversationsParams,
} from "@/types/conversation";

const conversationQueryKeyFactory = queryKeysFactory<
  "conversation",
  { type?: ConversationTypeEnum; limit?: number }
>("conversation");

export const conversationQueryKeys = {
  all: conversationQueryKeyFactory.all,
  lists: () => conversationQueryKeyFactory.lists(),
  list: (type?: ConversationTypeEnum, limit = 30) =>
    conversationQueryKeyFactory.list({ type, limit }),
};

export const CONVERSATIONS_DEFAULT_LIMIT = 30;

export function useConversationsInfiniteQuery(
  params: Omit<GetConversationsParams, "cursor"> & {
    limit?: number;
  } = {},
) {
  const { type, limit = CONVERSATIONS_DEFAULT_LIMIT } = params;

  return useInfiniteQuery<
    ConversationPage,
    Error,
    {
      pages: Array<ConversationPage>;
      pageParams: Array<string | undefined>;
    },
    ReturnType<typeof conversationQueryKeys.list>,
    string | undefined
  >({
    queryKey: conversationQueryKeys.list(type, limit),
    queryFn: ({ pageParam }) =>
      conversationService.getConversations({
        type,
        limit,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}
