import { UserItemAvatar } from "@/components/shared/user-item-avatar";
import { Button } from "@/components/ui/button";
import type { Friend } from "@/types/friend";
import { PresenceStatusEnum, presenceStatusLabels } from "@/types/user";
import { cn } from "@/utils/cn";
import { getUsernameLabel } from "@/utils/display";

type FriendSearchListItemProps = {
  conversationId?: string;
  friend: Friend;
  onSelectFriend: (friend: Friend) => void;
};

function getFriendPresenceLabel(friend: Friend) {
  const presenceStatus = friend.presenceStatus ?? PresenceStatusEnum.Checking;

  return (
    presenceStatusLabels[presenceStatus] ??
    presenceStatusLabels[PresenceStatusEnum.Checking]
  );
}

export function FriendSearchListItem({
  conversationId,
  friend,
  onSelectFriend,
}: FriendSearchListItemProps) {
  const usernameLabel = getUsernameLabel(friend.username);
  const presenceStatus = friend.presenceStatus ?? PresenceStatusEnum.Checking;

  return (
    <li>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-auto min-w-0 w-full justify-start overflow-hidden rounded-lg border-border/80 bg-background p-2 text-left whitespace-normal shadow-none",
          "hover:border-primary/50 hover:bg-muted/50",
        )}
        onClick={() => {
          onSelectFriend(friend);
        }}
      >
        <div className="flex min-h-12 min-w-0 w-full items-center gap-3">
          <UserItemAvatar
            compact
            displayName={friend.displayName}
            avatarUrl={friend.avatarUrl}
            presenceStatus={presenceStatus}
          />
          <div className="min-w-0 flex-1 py-1">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="m-0 min-w-0 flex-1 truncate text-sm font-medium">
                {friend.displayName}
              </p>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {conversationId ? "Open chat" : "New chat"}
              </span>
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              {usernameLabel ? (
                <p className="m-0 min-w-0 flex-1 truncate">{usernameLabel}</p>
              ) : null}
              <p className="m-0 shrink-0">{getFriendPresenceLabel(friend)}</p>
            </div>
          </div>
        </div>
      </Button>
    </li>
  );
}
