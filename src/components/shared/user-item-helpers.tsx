import { CircleAlert, MessageCircleMore, UserRoundCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { FriendRelationshipStatus } from "@/types/friend";
import {
  FriendRelationshipStatusEnum,
  friendRelationshipStatusLabels,
} from "@/types/friend-status";
import { PresenceStatusEnum, presenceStatusLabels } from "@/types/user";

export type UserItemPopupAction = {
  label: string;
  icon: ReactNode;
};

const SIZE_4_ICON_CLASS = "size-4";

function getStatusIcon(type: FriendRelationshipStatus): ReactNode {
  if (type === FriendRelationshipStatusEnum.Friend)
    return <UserRoundCheck className={SIZE_4_ICON_CLASS} />;
  if (type === FriendRelationshipStatusEnum.Sent)
    return <CircleAlert className={SIZE_4_ICON_CLASS} />;

  return <MessageCircleMore className={SIZE_4_ICON_CLASS} />;
}

export function getFriendStatusLabel(
  friendStatus?: FriendRelationshipStatus,
): string {
  const normalized = friendStatus ?? FriendRelationshipStatusEnum.None;

  return friendRelationshipStatusLabels[normalized];
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
  friendStatus?: FriendRelationshipStatus,
): UserItemPopupAction {
  const normalized = friendStatus ?? FriendRelationshipStatusEnum.None;

  if (normalized === FriendRelationshipStatusEnum.Friend) {
    return {
      label: "This user is your friend.",
      icon: getStatusIcon(FriendRelationshipStatusEnum.Friend),
    };
  }

  if (normalized === FriendRelationshipStatusEnum.Sent) {
    return {
      label: "Friend request has been sent. Waiting for reply.",
      icon: getStatusIcon(FriendRelationshipStatusEnum.Sent),
    };
  }

  if (normalized === FriendRelationshipStatusEnum.Pending) {
    return {
      label: "This user sent you a friend request. Waiting for your response.",
      icon: getStatusIcon(FriendRelationshipStatusEnum.Pending),
    };
  }

  if (normalized === FriendRelationshipStatusEnum.Self) {
    return {
      label: "This is your profile.",
      icon: getStatusIcon(FriendRelationshipStatusEnum.Friend),
    };
  }

  return {
    label: "Send friend request",
    icon: getStatusIcon(FriendRelationshipStatusEnum.None),
  };
}

export function getUserItemActionButtonLabel(
  friendStatus: FriendRelationshipStatus | undefined,
  isActionLoading: boolean,
): string | null {
  const normalized = friendStatus ?? FriendRelationshipStatusEnum.None;

  if (normalized === FriendRelationshipStatusEnum.Friend) {
    return isActionLoading ? "Unfriending..." : "Unfriend";
  }

  if (normalized === FriendRelationshipStatusEnum.Sent) {
    return isActionLoading ? "Cancelling request..." : "Cancel request";
  }

  if (normalized === FriendRelationshipStatusEnum.Pending) return null;

  if (normalized === FriendRelationshipStatusEnum.Self) return null;

  return isActionLoading ? "Sending request..." : "Send friend request";
}
