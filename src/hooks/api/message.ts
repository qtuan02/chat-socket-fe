import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UseMutationOptionsWrapper } from "@/libs/query-key-factory";
import { queryKeysFactory } from "@/libs/query-key-factory";
import { messageService } from "@/services/message-service";
import type {
  GetMessagesParams,
  MessageDto,
  MessagePage,
  SendDirectMessageRequest,
  SendGroupMessageRequest,
} from "@/types/message";

const messageQueryKeyFactory = queryKeysFactory<
  "message",
  { limit?: number },
  string
>("message");

export const messageQueryKeys = {
  all: messageQueryKeyFactory.all,
  conversations: () => messageQueryKeyFactory.details(),
  messages: (conversationId: string, limit = 50) =>
    messageQueryKeyFactory.detail(conversationId, { limit }),
};

export const MESSAGES_DEFAULT_LIMIT = 50;

export function useMessagesInfiniteQuery(
  params: Omit<GetMessagesParams, "cursor"> & {
    limit?: number;
  },
) {
  const { conversationId, limit = MESSAGES_DEFAULT_LIMIT } = params;

  return useInfiniteQuery<
    MessagePage,
    Error,
    {
      pages: Array<MessagePage>;
      pageParams: Array<string | undefined>;
    },
    ReturnType<typeof messageQueryKeys.messages>,
    string | undefined
  >({
    queryKey: messageQueryKeys.messages(conversationId, limit),
    queryFn: ({ pageParam }) =>
      messageService.getMessages({
        conversationId,
        limit,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
  });
}

export function useSendDirectMessageMutation(
  options?: UseMutationOptionsWrapper<
    SendDirectMessageRequest,
    MessageDto,
    Error
  >,
) {
  return useMutation({
    mutationFn: messageService.sendDirectMessage,
    onError: (error) => {
      toast.error(error?.message || "Unable to send direct message.");
    },
    ...options,
  });
}

export function useSendGroupMessageMutation(
  options?: UseMutationOptionsWrapper<
    SendGroupMessageRequest,
    MessageDto,
    Error
  >,
) {
  return useMutation({
    mutationFn: messageService.sendGroupMessage,
    onError: (error) => {
      toast.error(error?.message || "Unable to send group message.");
    },
    ...options,
  });
}
