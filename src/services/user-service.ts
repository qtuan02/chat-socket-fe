import { APP_API } from "@/config/routes";
import axiosClient from "@/libs/axios";
import type {
  UpdateUserRequestPayload,
  User,
  UserDto,
  UserInfoDto,
  UserInfoResponse,
  UserItemData,
  UserResponse,
} from "@/types/user";
import { PresenceStatusEnum } from "@/types/user";
import { getDisplayName } from "@/utils/display";

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

function toUserInfoModel(dto: UserInfoDto): UserItemData {
  return {
    id: dto.id,
    username: dto.username,
    firstName: dto.firstName,
    lastName: dto.lastName,
    displayName: getDisplayName(dto),
    email: dto.email,
    avatarUrl: dto.avatarUrl,
    bio: dto.bio,
    phone: dto.phone,
    joinedAt: dto.joinedAt,
  };
}

export const userService = {
  getCurrentUserProfile: async () => {
    const response = await axiosClient.get<UserResponse>(
      `${APP_API.v1.base}${APP_API.v1.user.me}`,
    );

    return toUserModel(response.data.data);
  },

  getUserInfo: async (userId: string): Promise<UserItemData> => {
    const response = await axiosClient.get<UserInfoResponse>(
      `${APP_API.v1.base}${APP_API.v1.user.info}`,
      {
        params: {
          userId,
        },
      },
    );

    return toUserInfoModel(response.data.data);
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
