import { Button } from "@/components/ui/button";
import { FriendStatus } from "@/types/friend-status";

type DirectConversationFriendStatusRowProps = {
  statusFriend?: FriendStatus;
  isLoading: boolean;
  isSendingFriendRequest: boolean;
  onAddFriend: () => void;
};

export function DirectConversationFriendStatusRow({
  statusFriend,
  isLoading,
  isSendingFriendRequest,
  onAddFriend,
}: DirectConversationFriendStatusRowProps) {
  if (isLoading) return null;
  if (!statusFriend) return null;
  if (
    statusFriend === FriendStatus.FRIEND ||
    statusFriend === FriendStatus.SELF
  ) {
    return null;
  }

  if (statusFriend === FriendStatus.NONE) {
    return (
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2 md:px-4">
        <p className="truncate text-xs text-muted-foreground">
          You are not friends yet.
        </p>
        <Button
          type="button"
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={onAddFriend}
          disabled={isSendingFriendRequest}
        >
          {isSendingFriendRequest ? "Sending..." : "Add friend"}
        </Button>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground md:px-4">
      {statusFriend === FriendStatus.SENT
        ? "Friend request pending."
        : "This user sent you a friend request."}
    </div>
  );
}
