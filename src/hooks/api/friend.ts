import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useCurrentUserQuery } from "@/hooks/api/user";
import {
  queryKeysFactory,
  type UseMutationOptionsWrapper,
  type UseQueryOptionsWrapper,
} from "@/libs/query-key-factory";
import { friendService } from "@/services/friend-service";
import { useSocketStore } from "@/stores/useSocketStore";
import type {
  FriendActionRequest,
  FriendListParams,
  FriendRequests,
  FriendRequestUser,
  FriendSendRequestPayload,
  FriendsPage,
} from "@/types/friend";
import { PresenceStatusEnum } from "@/types/user";

const friendQueryKeyFactory = queryKeysFactory<"friend">("friend");

const friendRequestQueryKeyFactory =
  queryKeysFactory<"friend-request">("friend-request");
const INITIAL_OFFSET_PAGE_PARAM: number | undefined = undefined;

export const friendQueryKeys = {
  ...friendQueryKeyFactory,
  list: (userId: string, params: FriendListParams = {}) =>
    friendQueryKeyFactory.list({
      userId,
      search: params.search,
      offset: params.offset,
      limit: params.limit,
    }),
  listInfinite: (
    userId: string,
    params: Omit<FriendListParams, "offset"> = {},
  ) =>
    friendQueryKeyFactory.list({
      userId,
      search: params.search,
      limit: params.limit,
    }),
};

export const friendRequestQueryKeys = {
  ...friendRequestQueryKeyFactory,
  list: (userId: string) =>
    friendRequestQueryKeyFactory.list({
      userId,
    }),
};

function getPresenceStatusFromOnlineUsers(
  userId: string,
  onlineUserIds: ReadonlySet<string>,
): PresenceStatusEnum {
  return onlineUserIds.has(userId)
    ? PresenceStatusEnum.Online
    : PresenceStatusEnum.Offline;
}

export function useFriendsInfiniteQuery(
  params: Omit<FriendListParams, "offset"> = {},
) {
  const { data: currentUser } = useCurrentUserQuery();
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const onlineUserIds = React.useMemo(
    () => new Set(onlineUsers),
    [onlineUsers],
  );

  const query = useInfiniteQuery<
    FriendsPage,
    Error,
    {
      pages: Array<FriendsPage>;
      pageParams: Array<number | undefined>;
    },
    ReturnType<typeof friendQueryKeys.listInfinite>,
    number | undefined
  >({
    queryKey: friendQueryKeys.listInfinite(currentUser?.id ?? "", {
      search: params.search,
      limit: params.limit,
    }),
    queryFn: ({ pageParam }) =>
      friendService.getFriends({
        search: params.search,
        limit: params.limit,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    initialPageParam: INITIAL_OFFSET_PAGE_PARAM,
    enabled: !!currentUser?.id,
    staleTime: 0,
  });

  const friends = React.useMemo(
    () =>
      query.data?.pages.flatMap((page) =>
        page.messages.map((friend) => {
          const presenceStatus = getPresenceStatusFromOnlineUsers(
            friend.id,
            onlineUserIds,
          );
          if (presenceStatus === friend.presenceStatus) return friend;

          return {
            ...friend,
            presenceStatus,
          };
        }),
      ) ?? [],
    [onlineUserIds, query.data?.pages],
  );

  return {
    ...query,
    friends,
  };
}

export function useFriendRequestsQuery(
  options?: UseQueryOptionsWrapper<FriendRequests, Error>,
) {
  const { data: currentUser } = useCurrentUserQuery();

  return useQuery({
    ...options,
    queryKey: friendRequestQueryKeys.list(currentUser?.id ?? ""),
    queryFn: friendService.getFriendRequests,
    enabled: !!currentUser?.id && (options?.enabled ?? true),
    staleTime: 0,
  });
}

export function useSendFriendRequestMutation(
  options?: UseMutationOptionsWrapper<
    FriendSendRequestPayload,
    string | null,
    Error
  >,
) {
  return useMutation({
    mutationFn: friendService.sendFriendRequest,
    ...options,
  });
}

export function useAcceptFriendRequestMutation(
  options?: UseMutationOptionsWrapper<
    FriendActionRequest,
    FriendRequestUser,
    Error
  >,
) {
  return useMutation({
    mutationFn: friendService.acceptFriendRequest,
    ...options,
  });
}

export function useDeclineFriendRequestMutation(
  options?: UseMutationOptionsWrapper<
    FriendActionRequest,
    string | null,
    Error
  >,
) {
  return useMutation({
    mutationFn: friendService.declineFriendRequest,
    ...options,
  });
}

export function useCancelFriendRequestMutation(
  options?: UseMutationOptionsWrapper<
    FriendActionRequest,
    string | null,
    Error
  >,
) {
  return useMutation({
    mutationFn: friendService.cancelFriendRequest,
    ...options,
  });
}

export function useDeleteFriendMutation(
  options?: UseMutationOptionsWrapper<string, string | null, Error>,
) {
  return useMutation({
    mutationFn: friendService.deleteFriend,
    ...options,
  });
}
