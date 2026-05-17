import * as React from "react";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import { useConversationsInfiniteQuery } from "@/hooks/api/conversation";
import {
  type ConversationPage,
  ConversationTypeEnum,
} from "@/types/conversation";
import type { Friend } from "@/types/friend";

type DirectConversationPages = { pages: ConversationPage[] } | undefined;

function findDirectConversationId(
  data: DirectConversationPages,
  friendId: string,
) {
  for (const page of data?.pages ?? []) {
    const conversation = page.items.find(
      (item) =>
        item.type === ConversationTypeEnum.DIRECT &&
        (item.directUserAId === friendId || item.directUserBId === friendId),
    );

    if (conversation) return conversation.id;
  }

  return null;
}

function hasMoreConversationPages(data: DirectConversationPages) {
  const lastPage = data?.pages[data.pages.length - 1];

  return Boolean(lastPage?.nextCursor);
}

export function useOpenDirectConversation() {
  const navigate = useNavigate();
  const { data, fetchNextPage, isLoading, refetch } =
    useConversationsInfiniteQuery({
      type: ConversationTypeEnum.DIRECT,
      limit: 100,
    });

  return React.useCallback(
    async (friend: Friend) => {
      let conversationPages = data;
      let conversationId = findDirectConversationId(
        conversationPages,
        friend.id,
      );

      if (conversationId) {
        navigate(APP_ROUTES.conversationById(conversationId));
        return;
      }

      if (!conversationPages || isLoading) {
        const result = await refetch();
        conversationPages = result.data;
        conversationId = findDirectConversationId(conversationPages, friend.id);

        if (conversationId) {
          navigate(APP_ROUTES.conversationById(conversationId));
          return;
        }
      }

      while (hasMoreConversationPages(conversationPages)) {
        const result = await fetchNextPage();
        conversationPages = result.data;
        conversationId = findDirectConversationId(conversationPages, friend.id);

        if (conversationId) {
          navigate(APP_ROUTES.conversationById(conversationId));
          return;
        }
      }

      navigate(APP_ROUTES.chat, {
        state: { directMessageDraftFriend: friend },
      });
    },
    [data, fetchNextPage, isLoading, navigate, refetch],
  );
}
