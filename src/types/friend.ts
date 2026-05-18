import type {
  BaseResponse,
  PaginationRequest,
  PaginationResponse,
} from "@/types/base";
import type { PresenceStatusEnum, UserIdentity } from "@/types/user";

export type Friend = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  joinedAt: string;
};

export type FriendWithPresence = Friend & {
  presenceStatus?: PresenceStatusEnum;
};

export type FriendRequestUser = Pick<
  UserIdentity,
  "id" | "firstName" | "lastName" | "username"
> & {
  avatarUrl?: string | null;
  bio?: string | null;
};

export type SentFriendRequest = {
  id: string;
  fromUser: string;
  toUser: FriendRequestUser;
  message: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReceivedFriendRequest = {
  id: string;
  toUser: string;
  fromUser: FriendRequestUser;
  message: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FriendRequests = {
  sentRequests: SentFriendRequest[];
  receivedRequests: ReceivedFriendRequest[];
};

export type FriendListParams = Omit<PaginationRequest, "cursor"> & {
  search?: string;
};

export type FriendsPage = PaginationResponse<FriendWithPresence>;

export type FriendPageResponse = BaseResponse<PaginationResponse<Friend>>;

export type FriendRequestsResponse = BaseResponse<FriendRequests>;
export type FriendSendResponse = BaseResponse<string | null>;
export type FriendAcceptResponse = BaseResponse<FriendRequestUser>;

export type FriendSendRequestPayload = {
  toUserId: string;
  message?: string;
};

export type FriendActionRequest = {
  requestId: string;
};
