import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserItemActionButtonLabel } from "@/features/friends/components/user-item-helpers";
import { FriendStatus } from "@/types/friend-status";

type UserItemActionButtonProps = {
  userId: string;
  friendStatus?: FriendStatus;
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
  const normalized = friendStatus ?? FriendStatus.NONE;
  const buttonLabel = getUserItemActionButtonLabel(normalized, isActionLoading);

  if (!buttonLabel) return null;

  if (normalized === FriendStatus.FRIEND && !onUnfriend) return null;
  if (normalized === FriendStatus.SENT && !onCancelFriendRequest) return null;
  if (normalized === FriendStatus.NONE && !onSendFriendRequest) return null;

  if (normalized === FriendStatus.RECEIVED) {
    return (
      <Button type="button" variant="outline" className="w-full" disabled>
        {buttonLabel}
      </Button>
    );
  }

  if (normalized === FriendStatus.SELF) return null;

  const variant =
    normalized === FriendStatus.FRIEND
      ? "destructive"
      : normalized === FriendStatus.SENT
        ? "outline"
        : "default";

  const handleAction = () => {
    if (normalized === FriendStatus.FRIEND) {
      onUnfriend?.(userId);
      return;
    }

    if (normalized === FriendStatus.SENT) {
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
