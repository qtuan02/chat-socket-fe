export const MESSAGES_DEFAULT_LIMIT = 50;
export const MESSAGE_LIST_FIRST_ITEM_INDEX = 1_000_000;

export const VIETNAM_LOCALE = "vi-VN";
export const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
export const ONE_MINUTE_IN_MS = 60 * 1000;
export const ONE_HOUR_IN_MS = 60 * ONE_MINUTE_IN_MS;
export const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;
export const ONE_WEEK_IN_MS = 7 * ONE_DAY_IN_MS;
export const ONE_YEAR_IN_MS = 365 * ONE_DAY_IN_MS;

export const FRIEND_SEARCH_LIMIT = 50;

export const CONVERSATION_LABELS = {
  noActivity: "No activity yet",
  activeNow: "Active now",
  activeJustNow: "Active just now",
  presencePending: "Checking status",
  activeMemberSingular: "active member",
  activeMemberPlural: "active members",
} as const;

export const SOCKET_EVENT = {
  CONVERSATION_SEEN: "conversation.seen",
  CONVERSATION_UPDATED: "conversation.updated",
} as const;
