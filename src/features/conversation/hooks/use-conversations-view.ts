import * as React from "react";
import { mapConversationToUiModel } from "@/features/conversation/utils/map-conversation-to-ui-model";
import { useConversationsInfiniteQuery } from "@/hooks/api/conversation";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { useSocketStore } from "@/stores/useSocketStore";
import type { GetConversationsParams } from "@/types/conversation";

type UseConversationsViewParams = Omit<GetConversationsParams, "cursor"> & {
  limit?: number;
};

export function useConversationsView(params: UseConversationsViewParams = {}) {
  const { data: currentUser } = useCurrentUserQuery();
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const onlineUserIds = React.useMemo(
    () => new Set(onlineUsers),
    [onlineUsers],
  );
  const query = useConversationsInfiniteQuery(params);

  const conversations = React.useMemo(() => {
    return (
      query.data?.pages.flatMap((page) =>
        page.items.map((conversation) =>
          mapConversationToUiModel(
            conversation,
            currentUser?.id ?? "",
            onlineUserIds,
          ),
        ),
      ) ?? []
    );
  }, [currentUser?.id, onlineUserIds, query.data?.pages]);

  return {
    ...query,
    conversations,
  };
}
