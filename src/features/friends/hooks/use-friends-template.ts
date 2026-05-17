import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import {
  friendQueryKeys,
  useDeleteFriendMutation,
  useFriendRequestsQuery,
  useFriendsQuery,
} from "@/hooks/api/friend";
import { currentUserQueryKeys, useUserInfoQuery } from "@/hooks/api/user";
import type { Friend } from "@/types/friend";
import { useAddFriendDialog } from "./use-add-friend-dialog";
import { useFriendRequestActions } from "./use-friend-request-actions";
import { useOpenDirectConversation } from "./use-open-direct-conversation";

function getVisibleFriends(friends: Friend[], searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) return friends;

  return friends.filter((friend) =>
    [friend.displayName, friend.username]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

export function useFriendsTemplate() {
  const queryClient = useQueryClient();
  const [friendSearchTerm, setFriendSearchTerm] = React.useState("");
  const [selectedFriendInfoId, setSelectedFriendInfoId] = React.useState<
    string | null
  >(null);
  const [processingFriendId, setProcessingFriendId] = React.useState<
    string | null
  >(null);

  const friendsQuery = useFriendsQuery();
  const friendRequestsQuery = useFriendRequestsQuery();
  const friendInfoQuery = useUserInfoQuery(selectedFriendInfoId);
  const addFriend = useAddFriendDialog();
  const friendRequests = useFriendRequestActions();
  const openDirectConversation = useOpenDirectConversation();

  const deleteFriendMutation = useDeleteFriendMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: friendQueryKeys.all });
      toast.success("Friend removed.");
    },
  });

  const handleOpenFriendDetails = (friendId: string) => {
    setSelectedFriendInfoId(friendId);
    void queryClient.invalidateQueries({
      queryKey: currentUserQueryKeys.info(friendId),
    });
  };

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

  const allFriends = friendsQuery.data?.items ?? [];
  const visibleFriends = getVisibleFriends(allFriends, friendSearchTerm);

  return {
    addFriend,
    friends: {
      items: visibleFriends,
      searchTerm: friendSearchTerm,
      setSearchTerm: setFriendSearchTerm,
      isLoading: friendsQuery.isLoading || friendsQuery.isRefetching,
      isError: friendsQuery.isError,
      error: friendsQuery.error,
      refetch: friendsQuery.refetch,
    },
    friendDetails: {
      error: friendInfoQuery.error,
      isLoading: friendInfoQuery.isLoading || friendInfoQuery.isFetching,
      selectedFriendInfo: friendInfoQuery.data,
      selectedFriendInfoId,
      processingFriendId,
      open: handleOpenFriendDetails,
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
