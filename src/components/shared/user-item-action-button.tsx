import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FriendRelationshipStatus } from "@/types/friend";
import { FriendRelationshipStatusEnum } from "@/types/friend-status";
import { getUserItemActionButtonLabel } from "./user-item-helpers";

type UserItemActionButtonProps = {
  userId: string;
  friendStatus?: FriendRelationshipStatus;
  actionPayload?: string;
  isActionLoading: boolean;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  onCancelFriendRequest?: (userId: string) => void;
  onUnfriend?: (userId: string) => void;
};

export function UserItemActionButton({
  userId,
  friendStatus,
  actionPayload,
  isActionLoading,
  onSendFriendRequest,
  onCancelFriendRequest,
  onUnfriend,
}: UserItemActionButtonProps) {
  const normalized = friendStatus ?? FriendRelationshipStatusEnum.None;
  const buttonLabel = getUserItemActionButtonLabel(normalized, isActionLoading);

  if (!buttonLabel) return null;

  if (normalized === FriendRelationshipStatusEnum.Friend && !onUnfriend)
    return null;
  if (
    normalized === FriendRelationshipStatusEnum.Sent &&
    !onCancelFriendRequest
  )
    return null;
  if (normalized === FriendRelationshipStatusEnum.None && !onSendFriendRequest)
    return null;

  const variant =
    normalized === FriendRelationshipStatusEnum.Friend
      ? "destructive"
      : normalized === FriendRelationshipStatusEnum.Sent
        ? "outline"
        : "default";

  const handleAction = () => {
    if (normalized === FriendRelationshipStatusEnum.Friend) {
      onUnfriend?.(userId);
      return;
    }

    if (normalized === FriendRelationshipStatusEnum.Sent) {
      onCancelFriendRequest?.(userId);
      return;
    }

    onSendFriendRequest?.(userId, actionPayload);
  };

  return (
    <Button
      type="button"
      variant={variant}
      className="w-full"
      onClick={handleAction}
      disabled={isActionLoading}
    >
      {isActionLoading ? <Loader2 className="size-4 animate-spin" /> : null}
      {buttonLabel}
    </Button>
  );
}
