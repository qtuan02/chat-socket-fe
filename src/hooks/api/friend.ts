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
  AcceptFriendResponseDto,
  Friend,
  FriendActionRequest,
  FriendListParams,
  FriendRequests,
  FriendSearchResult,
  FriendSendRequestPayload,
  FriendsPage,
} from "@/types/friend";
import { PresenceStatusEnum } from "@/types/user";

const friendQueryKeyFactory = queryKeysFactory<"friend">("friend");

const friendRequestQueryKeyFactory =
  queryKeysFactory<"friend-request">("friend-request");

export const friendQueryKeys = {
  ...friendQueryKeyFactory,
  list: (userId: string, params: FriendListParams = {}) =>
    friendQueryKeyFactory.list({
      userId,
      search: params.search,
      cursor: params.cursor,
      limit: params.limit,
    }),
  listInfinite: (
    userId: string,
    params: Omit<FriendListParams, "cursor"> = {},
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
  isPresenceReady: boolean,
  fallbackPresenceStatus?: PresenceStatusEnum,
): PresenceStatusEnum {
  if (!isPresenceReady) {
    return fallbackPresenceStatus ?? PresenceStatusEnum.Checking;
  }

  return onlineUserIds.has(userId)
    ? PresenceStatusEnum.Online
    : PresenceStatusEnum.Offline;
}

function applyFriendsPresence(
  data: FriendsPage | undefined,
  onlineUserIds: ReadonlySet<string>,
  isPresenceReady: boolean,
): FriendsPage | undefined {
  if (!data) return data;

  return {
    ...data,
    items: data.items.map(
      (friend): Friend => ({
        ...friend,
        presenceStatus: getPresenceStatusFromOnlineUsers(
          friend.id,
          onlineUserIds,
          isPresenceReady,
          friend.presenceStatus,
        ),
      }),
    ),
  };
}

export function useFriendsQuery(
  params: FriendListParams = {},
  options?: UseQueryOptionsWrapper<FriendsPage, Error>,
) {
  const { data: currentUser } = useCurrentUserQuery();
  const isPresenceReady = useSocketStore((state) => state.isPresenceReady);
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const onlineUserIds = React.useMemo(
    () => new Set(onlineUsers),
    [onlineUsers],
  );

  const query = useQuery({
    ...options,
    queryKey: friendQueryKeys.list(currentUser?.id ?? "", params),
    queryFn: () => friendService.getFriends(params),
    enabled: !!currentUser?.id && (options?.enabled ?? true),
  });
  const data = React.useMemo(
    () => applyFriendsPresence(query.data, onlineUserIds, isPresenceReady),
    [isPresenceReady, onlineUserIds, query.data],
  );

  return {
    ...query,
    data,
  };
}

export function useFriendsInfiniteQuery(
  params: Omit<FriendListParams, "cursor"> = {},
) {
  const { data: currentUser } = useCurrentUserQuery();
  const isPresenceReady = useSocketStore((state) => state.isPresenceReady);
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
      pageParams: Array<string | undefined>;
    },
    ReturnType<typeof friendQueryKeys.listInfinite>,
    string | undefined
  >({
    queryKey: friendQueryKeys.listInfinite(currentUser?.id ?? "", {
      search: params.search,
      limit: params.limit,
    }),
    queryFn: ({ pageParam }) =>
      friendService.getFriends({
        search: params.search,
        limit: params.limit,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!currentUser?.id,
  });

  const friends = React.useMemo(
    () =>
      query.data?.pages.flatMap((page) =>
        page.items.map((friend) =>
          getPresenceStatusFromOnlineUsers(
            friend.id,
            onlineUserIds,
            isPresenceReady,
            friend.presenceStatus,
          ) === friend.presenceStatus
            ? friend
            : {
                ...friend,
                presenceStatus: getPresenceStatusFromOnlineUsers(
                  friend.id,
                  onlineUserIds,
                  isPresenceReady,
                  friend.presenceStatus,
                ),
              },
        ),
      ) ?? [],
    [isPresenceReady, onlineUserIds, query.data?.pages],
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
  });
}

export function useSearchFriendsByUsernameMutation(
  options?: UseMutationOptionsWrapper<string, FriendSearchResult[], Error>,
) {
  return useMutation({
    mutationFn: friendService.searchUsersByUsername,
    ...options,
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
    AcceptFriendResponseDto,
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
