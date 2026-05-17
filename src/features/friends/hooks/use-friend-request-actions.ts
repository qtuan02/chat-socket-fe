import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import {
  friendQueryKeys,
  friendRequestQueryKeys,
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useDeclineFriendRequestMutation,
} from "@/hooks/api/friend";

export function useFriendRequestActions() {
  const queryClient = useQueryClient();
  const [processingRequestId, setProcessingRequestId] = React.useState<
    string | null
  >(null);

  const acceptMutation = useAcceptFriendRequestMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
      toast.success("Friend request accepted.");
    },
  });
  const declineMutation = useDeclineFriendRequestMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.all,
      });
      toast.success("Friend request declined.");
    },
  });
  const cancelMutation = useCancelFriendRequestMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.all,
      });
      toast.success("Friend request cancelled.");
    },
  });

  const isProcessing =
    acceptMutation.isPending ||
    declineMutation.isPending ||
    cancelMutation.isPending;

  const clearProcessingRequest = (requestId: string) => {
    setProcessingRequestId((currentRequestId) =>
      currentRequestId === requestId ? null : currentRequestId,
    );
  };

  const acceptRequest = (requestId: string) => {
    if (isProcessing) return;

    setProcessingRequestId(requestId);
    acceptMutation.mutate(
      { requestId },
      {
        onSettled: () => {
          clearProcessingRequest(requestId);
        },
      },
    );
  };

  const declineRequest = (requestId: string) => {
    if (isProcessing) return;

    setProcessingRequestId(requestId);
    declineMutation.mutate(
      { requestId },
      {
        onSettled: () => {
          clearProcessingRequest(requestId);
        },
      },
    );
  };

  const cancelRequest = (requestId: string) => {
    if (isProcessing) return;

    setProcessingRequestId(requestId);
    cancelMutation.mutate(
      { requestId },
      {
        onSettled: () => {
          clearProcessingRequest(requestId);
        },
      },
    );
  };

  return {
    processingRequestId,
    acceptRequest,
    declineRequest,
    cancelRequest,
  };
}
