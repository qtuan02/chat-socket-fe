import { APP_API } from "@/config/routes";
import axiosClient from "@/libs/axios";
import type {
  FriendAcceptResponse,
  FriendActionRequest,
  FriendListParams,
  FriendPageResponse,
  FriendRequests,
  FriendRequestsResponse,
  FriendRequestUser,
  FriendSendRequestPayload,
  FriendSendResponse,
} from "@/types/friend";

const FRIENDS_DEFAULT_LIMIT = 50;

export const friendService = {
  getFriends: async (params: FriendListParams = {}) => {
    const { search, offset = 0, limit = FRIENDS_DEFAULT_LIMIT } = params;

    const response = await axiosClient.get<FriendPageResponse>(
      `${APP_API.v1.base}${APP_API.v1.friend.list}`,
      {
        params: {
          search,
          offset,
          limit,
        },
      },
    );

    return response.data.data;
  },

  getFriendRequests: async (): Promise<FriendRequests> => {
    const response = await axiosClient.get<FriendRequestsResponse>(
      `${APP_API.v1.base}${APP_API.v1.friend.requests}`,
    );

    return response.data.data;
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
  ): Promise<FriendRequestUser> => {
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
