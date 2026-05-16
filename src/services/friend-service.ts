import { APP_API } from "@/config/routes";
import axiosClient from "@/libs/axios";
import type {
  AcceptFriendResponseDto,
  Friend,
  FriendAcceptResponse,
  FriendActionRequest,
  FriendDto,
  FriendListParams,
  FriendPageResponse,
  FriendRelationshipStatus,
  FriendRequestReceivedDto,
  FriendRequestResponseDto,
  FriendRequestSentDto,
  FriendRequests,
  FriendRequestsResponse,
  FriendRequestUser,
  FriendSearchDto,
  FriendSearchResponse,
  FriendSearchResult,
  FriendSendRequestPayload,
  FriendSendResponse,
} from "@/types/friend";
import { FriendRelationshipStatusEnum } from "@/types/friend-status";
import { PresenceStatusEnum } from "@/types/user";
import { getDisplayName } from "@/utils/user-display";

const statusAliasByNormalizedValue: Record<
  string,
  FriendRelationshipStatusEnum
> = {
  friend: FriendRelationshipStatusEnum.Friend,
  isfriend: FriendRelationshipStatusEnum.Friend,
  alreadyfriend: FriendRelationshipStatusEnum.Friend,
  accepted: FriendRelationshipStatusEnum.Friend,
  sent: FriendRelationshipStatusEnum.Sent,
  outgoing: FriendRelationshipStatusEnum.Sent,
  requestsent: FriendRelationshipStatusEnum.Sent,
  requestsentbyme: FriendRelationshipStatusEnum.Sent,
  request_sent: FriendRelationshipStatusEnum.Sent,
  pending: FriendRelationshipStatusEnum.Pending,
  incoming: FriendRelationshipStatusEnum.Pending,
  requestreceived: FriendRelationshipStatusEnum.Pending,
  requestreceivedbyme: FriendRelationshipStatusEnum.Pending,
  request_pending: FriendRelationshipStatusEnum.Pending,
  self: FriendRelationshipStatusEnum.Self,
  me: FriendRelationshipStatusEnum.Self,
  myself: FriendRelationshipStatusEnum.Self,
  currentuser: FriendRelationshipStatusEnum.Self,
  own: FriendRelationshipStatusEnum.Self,
  none: FriendRelationshipStatusEnum.None,
  nofriend: FriendRelationshipStatusEnum.None,
  notfriend: FriendRelationshipStatusEnum.None,
  unknown: FriendRelationshipStatusEnum.None,
  unrelated: FriendRelationshipStatusEnum.None,
};

const FRIENDS_DEFAULT_LIMIT = 50;

function normalizePresenceStatus(rawStatus?: string): PresenceStatusEnum {
  if (!rawStatus) return PresenceStatusEnum.Checking;

  const normalizedStatus = rawStatus.trim().toLowerCase();

  if (normalizedStatus === "online") return PresenceStatusEnum.Online;
  if (normalizedStatus === "offline") return PresenceStatusEnum.Offline;

  return PresenceStatusEnum.Checking;
}

function normalizeFriendshipStatusValue(
  rawStatus?: string,
): FriendRelationshipStatus | undefined {
  if (!rawStatus) return undefined;

  const normalizedStatus = rawStatus.trim().toLowerCase();
  if (!normalizedStatus) return undefined;

  const normalizedValue = normalizedStatus.replace(/[_\-\s]/g, "");
  return statusAliasByNormalizedValue[normalizedValue];
}

function getFriendshipStatusFromDto(
  dto: FriendSearchDto,
): FriendRelationshipStatus | undefined {
  const candidateStatuses = [
    dto.friendshipStatus,
    dto.friendshipStatusText,
    dto.friendshipState,
    dto.friendship_state,
    dto.status,
    dto.state,
  ];

  for (const status of candidateStatuses) {
    const normalizedStatus = normalizeFriendshipStatusValue(status);
    if (normalizedStatus) return normalizedStatus;
  }

  return undefined;
}

function toFriend(dto: FriendDto): Friend {
  return {
    id: dto.id,
    username: dto.username,
    displayName: getDisplayName(dto),
    firstName: dto.firstName,
    lastName: dto.lastName,
    bio: dto.bio,
    avatarUrl: dto.avatarUrl ?? undefined,
    joinedAt: dto.joinedAt,
    friendshipStatus: FriendRelationshipStatusEnum.Friend,
    presenceStatus: normalizePresenceStatus(dto.status),
  };
}

function toFriendSearchResult(dto: FriendSearchDto): FriendSearchResult {
  return {
    id: dto.id,
    username: dto.username,
    displayName: getDisplayName(dto),
    firstName: dto.firstName,
    lastName: dto.lastName,
    bio: dto.bio,
    avatarUrl: dto.avatarUrl ?? undefined,
    joinedAt: dto.joinedAt,
    friendshipStatus: getFriendshipStatusFromDto(dto),
  };
}

function toFriendRequestUser(dto: AcceptFriendResponseDto): FriendRequestUser {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    displayName: getDisplayName({
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: dto.username,
    }),
    username: dto.username,
    avatarUrl: dto.avatarUrl ?? undefined,
    bio: dto.bio,
  };
}

function toSentRequest(dto: FriendRequestSentDto) {
  return {
    id: dto.id,
    user: toFriendRequestUser(dto.toUser),
    message: dto.message ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function toReceivedRequest(dto: FriendRequestReceivedDto) {
  return {
    id: dto.id,
    user: toFriendRequestUser(dto.fromUser),
    message: dto.message ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export const friendService = {
  getFriends: async (
    params: FriendListParams = {},
  ): Promise<{
    items: Friend[];
    nextCursor: string | null;
  }> => {
    const { search, cursor, limit = FRIENDS_DEFAULT_LIMIT } = params;
    const response = await axiosClient.get<FriendPageResponse>(
      `${APP_API.v1.base}${APP_API.v1.friend.list}`,
      {
        params: {
          search,
          cursor,
          limit,
        },
      },
    );
    const responseData = response.data.data;

    return {
      items: responseData.messages.map(toFriend),
      nextCursor: responseData.nextCursor,
    };
  },

  getFriendRequests: async (): Promise<FriendRequests> => {
    const response = await axiosClient.get<FriendRequestsResponse>(
      `${APP_API.v1.base}${APP_API.v1.friend.requests}`,
    );

    const responseData: FriendRequestResponseDto = response.data.data;

    return {
      sentRequests: responseData.sentRequests.map(toSentRequest),
      receivedRequests: responseData.receivedRequests.map(toReceivedRequest),
    };
  },

  searchUsersByUsername: async (
    username: string,
  ): Promise<FriendSearchResult[]> => {
    const response = await axiosClient.get<FriendSearchResponse>(
      `${APP_API.v1.base}${APP_API.v1.friend.search}`,
      {
        params: {
          username,
        },
      },
    );

    return response.data.data.map(toFriendSearchResult);
  },

  sendFriendRequest: async (
    payload: FriendSendRequestPayload,
  ): Promise<string | null> => {
    const response = await axiosClient.post<FriendSendResponse>(
      `${APP_API.v1.base}${APP_API.v1.friend.sendRequest}`,
      payload,
    );

    return response.data.data;
  },

  acceptFriendRequest: async (
    payload: FriendActionRequest,
  ): Promise<AcceptFriendResponseDto> => {
    const response = await axiosClient.post<FriendAcceptResponse>(
      `${APP_API.v1.base}${APP_API.v1.friend.acceptRequest}`,
      payload,
    );

    return response.data.data;
  },

  declineFriendRequest: async (
    payload: FriendActionRequest,
  ): Promise<string | null> => {
    const response = await axiosClient.post<FriendSendResponse>(
      `${APP_API.v1.base}${APP_API.v1.friend.declineRequest}`,
      payload,
    );

    return response.data.data;
  },

  cancelFriendRequest: async (
    payload: FriendActionRequest,
  ): Promise<string | null> => {
    const response = await axiosClient.post<FriendSendResponse>(
      `${APP_API.v1.base}${APP_API.v1.friend.cancelRequest}`,
      payload,
    );

    return response.data.data;
  },

  deleteFriend: async (friendId: string): Promise<string | null> => {
    const response = await axiosClient.delete<FriendSendResponse>(
      `${APP_API.v1.base}${APP_API.v1.friend.delete(friendId)}`,
    );

    return response.data.data;
  },
};
