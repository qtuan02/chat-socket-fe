import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import {
  friendRequestQueryKeys,
  useSendFriendRequestMutation,
} from "@/hooks/api/friend";
import { currentUserQueryKeys } from "@/hooks/api/user";

export function useConversationDetailsPanel() {
  const queryClient = useQueryClient();
  const [sendingFriendRequestId, setSendingFriendRequestId] = React.useState<
    string | null
  >(null);

  const { mutate: sendFriendRequest, isPending: isSendingFriendRequest } =
    useSendFriendRequestMutation({
      onSuccess: (_data, variables) => {
        void queryClient.invalidateQueries({
          queryKey: friendRequestQueryKeys.all,
        });
        void queryClient.invalidateQueries({
          queryKey: currentUserQueryKeys.info(variables.toUserId),
        });
        toast.success("Friend request sent.");
        setSendingFriendRequestId(null);
      },
    });

  const handleSendFriendRequest = React.useCallback(
    (userId: string, message?: string) => {
      if (isSendingFriendRequest) return;

      setSendingFriendRequestId(userId);
      sendFriendRequest(
        {
          toUserId: userId,
          message: message?.trim() || undefined,
        },
        {
          onSettled: () => {
            setSendingFriendRequestId((currentId) =>
              currentId === userId ? null : currentId,
            );
          },
        },
      );
    },
    [isSendingFriendRequest, sendFriendRequest],
  );

  return {
    onSendFriendRequest: handleSendFriendRequest,
    sendingFriendRequestId,
  };
}
