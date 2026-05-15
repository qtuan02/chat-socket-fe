import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { conversationQueryKeys } from "@/hooks/api/conversation";
import {
  MESSAGES_DEFAULT_LIMIT,
  messageQueryKeys,
  useSendDirectMessageMutation,
  useSendGroupMessageMutation,
} from "@/hooks/api/message";
import type { Conversation } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import type {
  MessageDto,
  MessagePage,
  SendDirectMessageRequest,
  SendGroupMessageRequest,
} from "@/types/message";
import { MessageTypeEnum } from "@/types/message";

function appendMessageToCache(queryClient: QueryClient, message: MessageDto) {
  queryClient.setQueryData<InfiniteData<MessagePage, string | undefined>>(
    messageQueryKeys.messages(message.conversationId, MESSAGES_DEFAULT_LIMIT),
    (oldData) => {
      if (!oldData) {
        return {
          pages: [{ items: [message], nextCursor: null }],
          pageParams: [undefined],
        };
      }

      const alreadyExists = oldData.pages.some((page) =>
        page.items.some((item) => item.id === message.id),
      );

      if (alreadyExists) {
        return oldData;
      }

      const firstPage = oldData.pages[0] ?? {
        items: [],
        nextCursor: null,
      };

      return {
        ...oldData,
        pages: [
          {
            ...firstPage,
            items: [...firstPage.items, message],
          },
          ...oldData.pages.slice(1),
        ],
      };
    },
  );
}

export function useSendChatMessage(conversation: Conversation) {
  const queryClient = useQueryClient();

  const handleMessageSent = React.useCallback(
    (message: MessageDto) => {
      appendMessageToCache(queryClient, message);
      void queryClient.invalidateQueries({
        queryKey: conversationQueryKeys.lists(),
      });
    },
    [queryClient],
  );

  const directMessageMutation = useSendDirectMessageMutation({
    onSuccess: handleMessageSent,
  });
  const groupMessageMutation = useSendGroupMessageMutation({
    onSuccess: handleMessageSent,
  });

  const sendMessage = React.useCallback(
    async (content: string) => {
      const payload = {
        conversationId: conversation.id,
        content,
        type: MessageTypeEnum.TEXT,
        attachmentUrl: null,
      } satisfies SendDirectMessageRequest & SendGroupMessageRequest;

      if (conversation.type === ConversationTypeEnum.DIRECT) {
        await directMessageMutation.mutateAsync(payload);
        return;
      }

      await groupMessageMutation.mutateAsync(payload);
    },
    [
      conversation.id,
      conversation.type,
      directMessageMutation.mutateAsync,
      groupMessageMutation.mutateAsync,
    ],
  );

  return {
    isSending:
      directMessageMutation.isPending || groupMessageMutation.isPending,
    sendMessage,
  };
}
