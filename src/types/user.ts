import type { BaseResponse, PaginationResponse } from "@/types/base";
import type { FriendStatus } from "@/types/friend-status";

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

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  role?: string;
  status?: string;
  avatarUrl?: string | null;
  bio?: string;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UserIdentity = Pick<
  UserProfile,
  "id" | "username" | "firstName" | "lastName" | "avatarUrl" | "bio"
>;

export type User = Omit<UserProfile, "status"> & {
  presenceStatus?: PresenceStatusEnum;
};

export type UserItemData = {
  id: string;
  displayName?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  statusFriend?: FriendStatus;
  joinedAt?: string;
  presenceStatus?: PresenceStatusEnum;
  requestId?: string;
};

export type UserInfo = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  joinedAt: string;
  statusFriend: FriendStatus;
};

export type UserResponse = BaseResponse<UserProfile>;
export type UserInfoResponse = BaseResponse<UserInfo>;

export type UserSearch = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  joinedAt: string;
  statusFriend: FriendStatus;
  requestId?: string;
};

export type DirectMessageUser = Pick<
  UserSearch,
  "id" | "username" | "firstName" | "lastName" | "avatarUrl" | "joinedAt"
>;

export type UserSearchResponse = BaseResponse<PaginationResponse<UserSearch>>;

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
