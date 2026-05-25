import { APP_API } from "@/config/routes";
import { axiosClient } from "@/libs/axios";
import type {
  UpdateUserRequestPayload,
  User,
  UserInfo,
  UserInfoResponse,
  UserResponse,
  UserSearchResponse,
} from "@/types/user";
import { PresenceStatusEnum } from "@/types/user";

function normalizePresenceStatus(rawStatus?: string): PresenceStatusEnum {
  if (!rawStatus) {
    return PresenceStatusEnum.Checking;
  }

  const normalizedStatus = rawStatus.trim().toLowerCase();
  if (normalizedStatus === "online") return PresenceStatusEnum.Online;
  if (normalizedStatus === "offline") return PresenceStatusEnum.Offline;

  return PresenceStatusEnum.Checking;
}

export const userService = {
  getCurrentUserProfile: async () => {
    const response = await axiosClient.get<UserResponse>(
      `${APP_API.v1.base}${APP_API.v1.user.me}`,
    );
    const { status, ...user } = response.data.data;

    return {
      ...user,
      presenceStatus: normalizePresenceStatus(status),
    };
  },

  getUserInfo: async (userId: string): Promise<UserInfo> => {
    const response = await axiosClient.get<UserInfoResponse>(
      `${APP_API.v1.base}${APP_API.v1.user.info}`,
      {
        params: {
          userId,
        },
      },
    );

    return response.data.data;
  },

  searchUsers: async (params: {
    search?: string;
    offset?: number;
    limit?: number;
  }) => {
    const response = await axiosClient.get<UserSearchResponse>(
      `${APP_API.v1.base}${APP_API.v1.user.search}`,
      {
        params,
      },
    );

    return response.data.data;
  },

  updateCurrentUserProfile: async (
    payload: UpdateUserRequestPayload,
  ): Promise<User> => {
    const response = await axiosClient.patch<UserResponse>(
      `${APP_API.v1.base}${APP_API.v1.user.me}`,
      payload,
    );
    const { status, ...user } = response.data.data;

    return {
      ...user,
      presenceStatus: normalizePresenceStatus(status),
    };
  },
};
