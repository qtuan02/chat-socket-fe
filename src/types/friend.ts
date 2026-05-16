import type { BaseResponse } from "@/types/base";
import { FriendRelationshipStatusEnum } from "@/types/friend-status";
import type {
  PresenceStatusEnum,
  UserIdentity,
  UserItemData,
} from "@/types/user";

export { FriendRelationshipStatusEnum };

export type FriendRelationshipStatus = FriendRelationshipStatusEnum;

type FriendIdentityDto = Omit<UserIdentity, "avatarUrl"> & {
  avatarUrl?: string | null;
  status?: string;
};

export interface FriendDto extends FriendIdentityDto {
  joinedAt: string;
}

export interface FriendSearchDto extends FriendIdentityDto {
  joinedAt: string;
  friendshipStatus?: string;
  friendshipStatusText?: string;
  friendshipState?: string;
  friendship_state?: string;
  state?: string;
}

export interface AcceptFriendResponseDto extends FriendIdentityDto {}

export interface FriendRequestSentDto {
  id: string;
  fromUser: string;
  toUser: AcceptFriendResponseDto;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequestReceivedDto {
  id: string;
  toUser: string;
  fromUser: AcceptFriendResponseDto;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequestResponseDto {
  sentRequests: FriendRequestSentDto[];
  receivedRequests: FriendRequestReceivedDto[];
}

type FriendProfile = Pick<
  UserItemData,
  | "id"
  | "username"
  | "firstName"
  | "lastName"
  | "avatarUrl"
  | "bio"
  | "displayName"
>;

export interface Friend extends FriendProfile {
  joinedAt: string;
  friendshipStatus?: FriendRelationshipStatus;
  presenceStatus?: PresenceStatusEnum;
}

export type FriendRequestUser = FriendProfile;

export interface FriendRequestItem {
  id: string;
  user: FriendRequestUser;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FriendSearchResult extends FriendProfile {
  joinedAt: string;
  friendshipStatus?: FriendRelationshipStatus;
}

export interface FriendsPage {
  items: Friend[];
  nextCursor: string | null;
}

export interface FriendRequests {
  sentRequests: FriendRequestItem[];
  receivedRequests: FriendRequestItem[];
}

export interface FriendListParams {
  search?: string;
  cursor?: string;
  limit?: number;
}

export type CursorPageResponseDto<T> = {
  messages: T[];
  nextCursor: string | null;
};

export type FriendPageResponse = BaseResponse<CursorPageResponseDto<FriendDto>>;
export type FriendSearchResponse = BaseResponse<FriendSearchDto[]>;
export type FriendRequestsResponse = BaseResponse<FriendRequestResponseDto>;
export type FriendSendResponse = BaseResponse<string | null>;
export type FriendAcceptResponse = BaseResponse<AcceptFriendResponseDto>;

export type FriendSendRequestPayload = {
  toUserId: string;
  message?: string;
};

export type FriendActionRequest = {
  requestId: string;
};
