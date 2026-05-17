import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import {
  friendQueryKeys,
  friendRequestQueryKeys,
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useDeclineFriendRequestMutation,
  useDeleteFriendMutation,
  useFriendRequestsQuery,
  useFriendsQuery,
  useSearchFriendsByUsernameMutation,
  useSendFriendRequestMutation,
} from "@/hooks/api/friend";
import { currentUserQueryKeys, useUserInfoQuery } from "@/hooks/api/user";
import type { Friend, FriendSearchResult } from "@/types/friend";

type AddFriendDialogState = {
  hasSearched: boolean;
  isOpen: boolean;
  lastSearchTerm: string;
  results: FriendSearchResult[];
};

export function useFriendsTemplate() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [friendSearchTerm, setFriendSearchTerm] = React.useState("");
  const [processingRequestId, setProcessingRequestId] = React.useState<
    string | null
  >(null);
  const [processingFriendId, setProcessingFriendId] = React.useState<
    string | null
  >(null);
  const [selectedFriendInfoId, setSelectedFriendInfoId] = React.useState<
    string | null
  >(null);
  const [sendingFriendId, setSendingFriendId] = React.useState<string | null>(
    null,
  );
  const [addFriendDialogState, setAddFriendDialogState] =
    React.useState<AddFriendDialogState>({
      isOpen: false,
      hasSearched: false,
      lastSearchTerm: "",
      results: [],
    });
  const friendsQuery = useFriendsQuery();
  const friendInfoQuery = useUserInfoQuery(selectedFriendInfoId);
  const friendRequestsQuery = useFriendRequestsQuery();

  const searchFriendsMutation = useSearchFriendsByUsernameMutation();
  const sendFriendRequestMutation = useSendFriendRequestMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.all,
      });
      toast.success("Friend request sent.");
      setSendingFriendId(null);
      setAddFriendDialogState((previous) => ({
        ...previous,
        isOpen: false,
      }));
    },
    onError: () => {
      setSendingFriendId(null);
    },
  });
  const acceptFriendRequestMutation = useAcceptFriendRequestMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: friendQueryKeys.all,
      });
      toast.success("Friend request accepted.");
      setProcessingRequestId(null);
    },
    onError: () => {
      setProcessingRequestId(null);
    },
  });
  const declineFriendRequestMutation = useDeclineFriendRequestMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.all,
      });
      toast.success("Friend request declined.");
      setProcessingRequestId(null);
    },
    onError: () => {
      setProcessingRequestId(null);
    },
  });
  const cancelFriendRequestMutation = useCancelFriendRequestMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.all,
      });
      toast.success("Friend request cancelled.");
      setProcessingRequestId(null);
    },
    onError: () => {
      setProcessingRequestId(null);
    },
  });
  const deleteFriendMutation = useDeleteFriendMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendQueryKeys.all,
      });
      toast.success("Friend removed.");
      setProcessingFriendId(null);
    },
    onError: () => {
      setProcessingFriendId(null);
    },
  });

  const isRequestsLoading =
    friendRequestsQuery.isLoading || friendRequestsQuery.isRefetching;
  const isFriendsLoading = friendsQuery.isLoading || friendsQuery.isRefetching;

  const handleOpenAddFriend = React.useCallback(() => {
    setAddFriendDialogState({
      isOpen: true,
      hasSearched: false,
      lastSearchTerm: "",
      results: [],
    });
  }, []);

  const handleCloseAddFriend = React.useCallback((nextOpenState: boolean) => {
    setAddFriendDialogState((previous) => ({
      ...previous,
      isOpen: nextOpenState,
      hasSearched: nextOpenState ? previous.hasSearched : false,
      results: nextOpenState ? previous.results : [],
      lastSearchTerm: nextOpenState ? previous.lastSearchTerm : "",
    }));

    if (!nextOpenState) {
      setSendingFriendId(null);
    }
  }, []);

  const handleSearchUser = React.useCallback(
    (username: string) => {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) return;

      setAddFriendDialogState((previous) => ({
        ...previous,
        hasSearched: true,
        lastSearchTerm: trimmedUsername,
        results: [],
      }));

      void searchFriendsMutation.mutateAsync(trimmedUsername, {
        onSuccess: (results) => {
          setAddFriendDialogState((previous) => ({
            ...previous,
            results,
          }));
        },
        onError: () => {
          setAddFriendDialogState((previous) => ({
            ...previous,
            results: [],
          }));
        },
      });
    },
    [searchFriendsMutation],
  );

  const handleSendFriendRequest = React.useCallback(
    (toUserId: string, message?: string) => {
      if (sendFriendRequestMutation.isPending) return;

      setSendingFriendId(toUserId);
      sendFriendRequestMutation.mutate(
        {
          toUserId,
          message: message?.trim() ? message.trim() : undefined,
        },
        {
          onSettled: () => {
            setSendingFriendId((currentSendingId) =>
              currentSendingId === toUserId ? null : currentSendingId,
            );
          },
        },
      );
    },
    [sendFriendRequestMutation],
  );

  const handleAcceptFriendRequest = React.useCallback(
    (requestId: string) => {
      if (acceptFriendRequestMutation.isPending) return;

      setProcessingRequestId(requestId);
      acceptFriendRequestMutation.mutate(
        { requestId },
        {
          onSettled: () => {
            setProcessingRequestId((currentRequestId) =>
              currentRequestId === requestId ? null : currentRequestId,
            );
          },
        },
      );
    },
    [acceptFriendRequestMutation],
  );

  const handleDeclineFriendRequest = React.useCallback(
    (requestId: string) => {
      if (declineFriendRequestMutation.isPending) return;

      setProcessingRequestId(requestId);
      declineFriendRequestMutation.mutate(
        { requestId },
        {
          onSettled: () => {
            setProcessingRequestId((currentRequestId) =>
              currentRequestId === requestId ? null : currentRequestId,
            );
          },
        },
      );
    },
    [declineFriendRequestMutation],
  );

  const handleCancelFriendRequest = React.useCallback(
    (requestId: string) => {
      if (cancelFriendRequestMutation.isPending) return;

      setProcessingRequestId(requestId);
      cancelFriendRequestMutation.mutate(
        { requestId },
        {
          onSettled: () => {
            setProcessingRequestId((currentRequestId) =>
              currentRequestId === requestId ? null : currentRequestId,
            );
          },
        },
      );
    },
    [cancelFriendRequestMutation],
  );

  const handleUnfriend = React.useCallback(
    (friendId: string) => {
      if (deleteFriendMutation.isPending) return;

      setProcessingFriendId(friendId);
      deleteFriendMutation.mutate(friendId, {
        onSettled: () => {
          setProcessingFriendId((currentFriendId) =>
            currentFriendId === friendId ? null : currentFriendId,
          );
        },
      });
    },
    [deleteFriendMutation],
  );

  const handleOpenFriendDetails = React.useCallback(
    (friendId: string) => {
      setSelectedFriendInfoId(friendId);
      void queryClient.invalidateQueries({
        queryKey: currentUserQueryKeys.info(friendId),
      });
    },
    [queryClient],
  );

  const handleMessageFriend = React.useCallback(
    (friend: Friend) => {
      navigate(APP_ROUTES.chat, {
        state: { directMessageDraftFriend: friend },
      });
    },
    [navigate],
  );

  return {
    friendSearchTerm,
    setFriendSearchTerm,
    isFriendsLoading,
    isRequestsLoading,
    friends: friendsQuery.data?.items ?? [],
    selectedFriendInfo: friendInfoQuery.data,
    selectedFriendInfoId,
    receivedRequests: friendRequestsQuery.data?.receivedRequests ?? [],
    sentRequests: friendRequestsQuery.data?.sentRequests ?? [],
    isFriendRequestsError: friendRequestsQuery.isError,
    isFriendsError: friendsQuery.isError,
    friendRequestsError: friendRequestsQuery.error,
    friendsError: friendsQuery.error,
    friendInfoError: friendInfoQuery.error,
    isFriendInfoLoading:
      friendInfoQuery.isLoading || friendInfoQuery.isFetching,
    processingRequestId,
    processingFriendId,
    sendingFriendId,
    searching: searchFriendsMutation.isPending,
    sendingRequest: sendFriendRequestMutation.isPending,
    searchError: searchFriendsMutation.error,
    addFriendDialogState,
    handleOpenAddFriend,
    handleCloseAddFriend: handleCloseAddFriend,
    handleSearchUser,
    handleSendFriendRequest,
    handleOpenFriendDetails,
    handleMessageFriend,
    handleAcceptFriendRequest,
    handleDeclineFriendRequest,
    handleCancelFriendRequest,
    handleUnfriend,
    refetchFriends: friendsQuery.refetch,
    refetchFriendRequests: friendRequestsQuery.refetch,
  };
}
