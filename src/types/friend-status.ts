export enum FriendStatus {
  NONE = "NONE",
  SELF = "SELF",
  FRIEND = "FRIEND",
  SENT = "SENT",
  RECEIVED = "RECEIVED",
}

export const friendStatusLabels: Record<FriendStatus, string> = {
  [FriendStatus.FRIEND]: "FRIEND",
  [FriendStatus.SENT]: "SENT",
  [FriendStatus.RECEIVED]: "RECEIVED",
  [FriendStatus.NONE]: "NONE",
  [FriendStatus.SELF]: "SELF",
};
