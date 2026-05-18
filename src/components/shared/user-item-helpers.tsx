import { CircleAlert, MessageCircleMore, UserRoundCheck } from "lucide-react";
import type { ReactNode } from "react";
import { FriendStatus, friendStatusLabels } from "@/types/friend-status";
import { PresenceStatusEnum, presenceStatusLabels } from "@/types/user";

export type UserItemPopupAction = {
  label: string;
  icon: ReactNode;
};

const SIZE_4_ICON_CLASS = "size-4";

function getStatusIcon(type: FriendStatus): ReactNode {
  if (type === FriendStatus.FRIEND)
    return <UserRoundCheck className={SIZE_4_ICON_CLASS} />;
  if (type === FriendStatus.SENT)
    return <CircleAlert className={SIZE_4_ICON_CLASS} />;
  if (type === FriendStatus.RECEIVED)
    return <MessageCircleMore className={SIZE_4_ICON_CLASS} />;

  return <MessageCircleMore className={SIZE_4_ICON_CLASS} />;
}

export function getFriendStatusLabel(friendStatus?: FriendStatus): string {
  const normalized = friendStatus ?? FriendStatus.NONE;

  return friendStatusLabels[normalized];
}

export function getPresenceStatusLabel(
  presenceStatus?: PresenceStatusEnum,
): string | null {
  if (!presenceStatus) return null;

  return (
    presenceStatusLabels[presenceStatus] ??
    presenceStatusLabels[PresenceStatusEnum.Checking]
  );
}

export function getFriendPopupAction(
  friendStatus?: FriendStatus,
): UserItemPopupAction {
  const normalized = friendStatus ?? FriendStatus.NONE;

  if (normalized === FriendStatus.FRIEND) {
    return {
      label: "This user is your friend.",
      icon: getStatusIcon(FriendStatus.FRIEND),
    };
  }

  if (normalized === FriendStatus.SENT) {
    return {
      label: "Friend request has been sent. Waiting for reply.",
      icon: getStatusIcon(FriendStatus.SENT),
    };
  }

  if (normalized === FriendStatus.RECEIVED) {
    return {
      label: "This user sent you a friend request.",
      icon: getStatusIcon(FriendStatus.RECEIVED),
    };
  }

  if (normalized === FriendStatus.SELF) {
    return {
      label: "This is your profile.",
      icon: getStatusIcon(FriendStatus.FRIEND),
    };
  }

  return {
    label: "Send friend request",
    icon: getStatusIcon(FriendStatus.NONE),
  };
}

export function getUserItemActionButtonLabel(
  friendStatus: FriendStatus | undefined,
  isActionLoading: boolean,
): string | null {
  const normalized = friendStatus ?? FriendStatus.NONE;

  if (normalized === FriendStatus.FRIEND) {
    return isActionLoading ? "Unfriending..." : "Unfriend";
  }

  if (normalized === FriendStatus.SENT) {
    return isActionLoading ? "Cancelling request..." : "Cancel request";
  }

  if (normalized === FriendStatus.RECEIVED) return "Pending request";

  if (normalized === FriendStatus.SELF) return null;

  return isActionLoading ? "Sending request..." : "Send friend request";
}
