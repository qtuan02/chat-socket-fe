import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import {
  friendQueryKeys,
  useDeleteFriendMutation,
  useFriendRequestsQuery,
  useFriendsInfiniteQuery,
} from "@/hooks/api/friend";
import { useDebounce } from "@/hooks/use-debounce";
import { useFriendRequestActions } from "./use-friend-request-actions";
import { useOpenDirectConversation } from "./use-open-direct-conversation";

const FRIEND_LIST_LIMIT = 50;
const FRIEND_SEARCH_DEBOUNCE_MS = 500;

export function useFriendsTemplate() {
  const queryClient = useQueryClient();
  const [friendSearchTerm, setFriendSearchTerm] = React.useState("");
  const trimmedFriendSearchInput = friendSearchTerm.trim();
  const debouncedFriendSearchTerm = useDebounce(
    trimmedFriendSearchInput,
    FRIEND_SEARCH_DEBOUNCE_MS,
  );
  const isDebouncingFriendSearch =
    trimmedFriendSearchInput !== debouncedFriendSearchTerm;
  const [processingFriendId, setProcessingFriendId] = React.useState<
    string | null
  >(null);

  const friendsQuery = useFriendsInfiniteQuery({
    limit: FRIEND_LIST_LIMIT,
    search: debouncedFriendSearchTerm || undefined,
  });
  const friendRequestsQuery = useFriendRequestsQuery();
  const friendRequests = useFriendRequestActions();
  const openDirectConversation = useOpenDirectConversation();

  const deleteFriendMutation = useDeleteFriendMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
      toast.success("Friend removed.");
    },
  });

  const handleUnfriend = (friendId: string) => {
    if (deleteFriendMutation.isPending) return;

    setProcessingFriendId(friendId);
    deleteFriendMutation.mutate(friendId, {
      onSettled: () => {
        setProcessingFriendId((currentFriendId) =>
          currentFriendId === friendId ? null : currentFriendId,
        );
      },
    });
  };

  return {
    friends: {
      messages: isDebouncingFriendSearch ? [] : friendsQuery.friends,
      searchTerm: friendSearchTerm,
      setSearchTerm: setFriendSearchTerm,
      isLoading: isDebouncingFriendSearch || friendsQuery.isLoading,
      isFetchingNextPage: friendsQuery.isFetchingNextPage,
      hasNextPage: Boolean(friendsQuery.hasNextPage),
      isError: friendsQuery.isError,
      error: friendsQuery.error,
      fetchNextPage: friendsQuery.fetchNextPage,
      refetch: friendsQuery.refetch,
    },
    friendDetails: {
      processingFriendId,
      message: openDirectConversation,
      unfriend: handleUnfriend,
    },
    requests: {
      received: friendRequestsQuery.data?.receivedRequests ?? [],
      sent: friendRequestsQuery.data?.sentRequests ?? [],
      isLoading:
        friendRequestsQuery.isLoading || friendRequestsQuery.isRefetching,
      isError: friendRequestsQuery.isError,
      error: friendRequestsQuery.error,
      refetch: friendRequestsQuery.refetch,
      processingRequestId: friendRequests.processingRequestId,
      accept: friendRequests.acceptRequest,
      decline: friendRequests.declineRequest,
      cancel: friendRequests.cancelRequest,
    },
  };
}
