import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import { useConversationsInfiniteQuery } from "@/hooks/api/conversation";
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
import {
  type ConversationPage,
  ConversationTypeEnum,
} from "@/types/conversation";
import type { Friend, FriendSearchResult } from "@/types/friend";

type AddFriendDialogState = {
  hasSearched: boolean;
  isOpen: boolean;
  lastSearchTerm: string;
  results: FriendSearchResult[];
};

function findDirectConversationIdByFriendId(
  data: { pages: Array<ConversationPage> } | undefined,
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

function hasMoreDirectConversationPages(
  data: { pages: Array<ConversationPage> } | undefined,
) {
  const lastPage = data?.pages[data.pages.length - 1];

  return Boolean(lastPage?.nextCursor);
}

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
  const {
    data: directConversationPages,
    fetchNextPage: fetchNextDirectConversationsPage,
    isLoading: isDirectConversationsLoading,
    refetch: refetchDirectConversations,
  } = useConversationsInfiniteQuery({
    type: ConversationTypeEnum.DIRECT,
    limit: 100,
  });
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
    async (friend: Friend) => {
      let conversationPages = directConversationPages;
      let existingConversationId = findDirectConversationIdByFriendId(
        conversationPages,
        friend.id,
      );

      if (existingConversationId) {
        navigate(APP_ROUTES.conversationById(existingConversationId));
        return;
      }

      if (!conversationPages || isDirectConversationsLoading) {
        const result = await refetchDirectConversations();
        conversationPages = result.data;
        existingConversationId = findDirectConversationIdByFriendId(
          conversationPages,
          friend.id,
        );

        if (existingConversationId) {
          navigate(APP_ROUTES.conversationById(existingConversationId));
          return;
        }
      }

      let hasNextPage = hasMoreDirectConversationPages(conversationPages);

      while (hasNextPage) {
        const result = await fetchNextDirectConversationsPage();
        conversationPages = result.data;
        existingConversationId = findDirectConversationIdByFriendId(
          conversationPages,
          friend.id,
        );

        if (existingConversationId) {
          navigate(APP_ROUTES.conversationById(existingConversationId));
          return;
        }

        hasNextPage = hasMoreDirectConversationPages(conversationPages);
      }

      navigate(APP_ROUTES.chat, {
        state: { directMessageDraftFriend: friend },
      });
    },
    [
      directConversationPages,
      fetchNextDirectConversationsPage,
      isDirectConversationsLoading,
      navigate,
      refetchDirectConversations,
    ],
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
