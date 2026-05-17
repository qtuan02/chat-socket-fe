import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import {
  friendRequestQueryKeys,
  useSearchFriendsByUsernameMutation,
  useSendFriendRequestMutation,
} from "@/hooks/api/friend";
import type { FriendSearchResult } from "@/types/friend";

type AddFriendDialogState = {
  hasSearched: boolean;
  isOpen: boolean;
  lastSearchTerm: string;
  results: FriendSearchResult[];
};

const closedDialogState: AddFriendDialogState = {
  isOpen: false,
  hasSearched: false,
  lastSearchTerm: "",
  results: [],
};

function getOpenedDialogState(): AddFriendDialogState {
  return {
    isOpen: true,
    hasSearched: false,
    lastSearchTerm: "",
    results: [],
  };
}

export function useAddFriendDialog() {
  const queryClient = useQueryClient();
  const [state, setState] =
    React.useState<AddFriendDialogState>(closedDialogState);
  const [sendingFriendId, setSendingFriendId] = React.useState<string | null>(
    null,
  );

  const searchMutation = useSearchFriendsByUsernameMutation();
  const sendRequestMutation = useSendFriendRequestMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.all,
      });
      toast.success("Friend request sent.");
      setState(closedDialogState);
    },
  });

  const open = () => {
    setState(getOpenedDialogState());
  };

  const setOpen = (isOpen: boolean) => {
    if (isOpen) {
      setState((currentState) => ({ ...currentState, isOpen: true }));
      return;
    }

    setState(closedDialogState);
    setSendingFriendId(null);
  };

  const search = (username: string) => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;

    setState((currentState) => ({
      ...currentState,
      hasSearched: true,
      lastSearchTerm: trimmedUsername,
      results: [],
    }));

    searchMutation.mutate(trimmedUsername, {
      onSuccess: (results) => {
        setState((currentState) => ({
          ...currentState,
          results,
        }));
      },
      onError: () => {
        setState((currentState) => ({
          ...currentState,
          results: [],
        }));
      },
    });
  };

  const sendRequest = (toUserId: string) => {
    if (sendRequestMutation.isPending) return;

    setSendingFriendId(toUserId);
    sendRequestMutation.mutate(
      { toUserId },
      {
        onSettled: () => {
          setSendingFriendId((currentId) =>
            currentId === toUserId ? null : currentId,
          );
        },
      },
    );
  };

  return {
    state,
    sendingFriendId,
    isSearching: searchMutation.isPending,
    isSendingRequest: sendRequestMutation.isPending,
    searchError: searchMutation.error,
    open,
    setOpen,
    search,
    sendRequest,
  };
}
