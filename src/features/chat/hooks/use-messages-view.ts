import * as React from "react";
import { MESSAGE_LIST_FIRST_ITEM_INDEX } from "@/config/constant";
import { mapMessageToUiModel } from "@/features/chat/utils/map-message-to-ui-model";
import { useMessagesInfiniteQuery } from "@/hooks/api/message";
import type { UseMessagesInfiniteQueryParams } from "@/types/message";

export function useMessagesView(params: UseMessagesInfiniteQueryParams) {
  const query = useMessagesInfiniteQuery(params);

  const senderNameById = React.useMemo(() => {
    return new Map(
      params.members.map((member) => [member.userId, member.displayName]),
    );
  }, [params.members]);

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
