export enum FriendRelationshipStatusEnum {
  Friend = "friend",
  Sent = "sent",
  Pending = "pending",
  None = "none",
  Self = "self",
}

export const friendRelationshipStatusLabels: Record<
  FriendRelationshipStatusEnum,
  string
> = {
  [FriendRelationshipStatusEnum.Friend]: "Friends",
  [FriendRelationshipStatusEnum.Sent]: "Request sent",
  [FriendRelationshipStatusEnum.Pending]: "Request pending",
  [FriendRelationshipStatusEnum.None]: "Not connected",
  [FriendRelationshipStatusEnum.Self]: "This is you",
};
