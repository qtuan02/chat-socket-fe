import { APP_API } from "@/config/routes";
import axiosClient from "@/libs/axios";
import type {
  UpdateUserRequestPayload,
  User,
  UserDto,
  UserResponse,
} from "@/types/user";
import { PresenceStatusEnum } from "@/types/user";

function normalizePresenceStatus(rawStatus?: string): PresenceStatusEnum {
  if (!rawStatus) {
    return PresenceStatusEnum.Checking;
  }

  const normalizedStatus = rawStatus.trim().toLowerCase();

  if (normalizedStatus === "online") {
    return PresenceStatusEnum.Online;
  }

  if (normalizedStatus === "offline") {
    return PresenceStatusEnum.Offline;
  }

  return PresenceStatusEnum.Checking;
}

function toUserModel(dto: UserDto): User {
  const { status, ...user } = dto;

  return {
    ...user,
    presenceStatus: normalizePresenceStatus(status),
  };
}

export const userService = {
  getCurrentUserProfile: async () => {
    const response = await axiosClient.get<UserResponse>(
      `${APP_API.v1.base}${APP_API.v1.user.me}`,
    );

    return toUserModel(response.data.data);
  },

  updateCurrentUserProfile: async (
    payload: UpdateUserRequestPayload,
  ): Promise<User> => {
    const response = await axiosClient.patch<UserResponse>(
      `${APP_API.v1.base}${APP_API.v1.user.me}`,
      payload,
    );

    return toUserModel(response.data.data);
  },
};
