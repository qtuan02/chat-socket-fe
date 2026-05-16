import type { BaseResponse } from "@/types/base";

export enum PresenceStatusEnum {
  Online = "ONLINE",
  Offline = "OFFLINE",
  Checking = "CHECKING",
}

export const presenceStatusLabels: Record<PresenceStatusEnum, string> = {
  [PresenceStatusEnum.Online]: "Online",
  [PresenceStatusEnum.Offline]: "Offline",
  [PresenceStatusEnum.Checking]: "Checking",
};

export interface UserProfileDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  status?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserIdentity = Pick<
  UserProfileDto,
  "id" | "username" | "firstName" | "lastName" | "avatarUrl" | "bio"
>;

export type UserDto = UserProfileDto;

export type User = Omit<UserProfileDto, "status"> & {
  presenceStatus?: PresenceStatusEnum;
};

export type UserItemData = Pick<UserIdentity, "id"> & {
  displayName: string;
  username?: UserIdentity["username"];
  firstName?: UserIdentity["firstName"];
  lastName?: UserIdentity["lastName"];
  avatarUrl?: UserIdentity["avatarUrl"];
  bio?: UserIdentity["bio"];
  joinedAt?: string;
  presenceStatus?: PresenceStatusEnum;
};

export type UserResponse = BaseResponse<User>;

export type UpdateUserRequestPayload = {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  avatarId?: string;
  bio?: string;
  phone?: string;
};
