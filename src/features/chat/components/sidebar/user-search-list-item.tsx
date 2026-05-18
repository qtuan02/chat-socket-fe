import { UserItemAvatar } from "@/components/shared/user-item-avatar";
import { Button } from "@/components/ui/button";
import { FriendStatus } from "@/types/friend-status";
import type { UserSearch } from "@/types/user";
import { cn } from "@/utils/cn";
import { getDisplayName, getUsernameLabel } from "@/utils/display";

type UserSearchListItemProps = {
  conversationId?: string;
  user: UserSearch;
  onSelectUser: (user: UserSearch) => void;
};

function getUserSearchStatusLabel(statusFriend: FriendStatus) {
  switch (statusFriend) {
    case FriendStatus.FRIEND:
      return "Friend";
    case FriendStatus.SENT:
      return "Request sent";
    case FriendStatus.RECEIVED:
      return "Request received";
    case FriendStatus.SELF:
      return "You";
    case FriendStatus.NONE:
      return "Not friends";
  }
}

function getUserSearchActionLabel(
  statusFriend: FriendStatus,
  conversationId?: string,
) {
  if (statusFriend === FriendStatus.SELF) return "You";

  return conversationId ? "Open chat" : "New chat";
}

export function UserSearchListItem({
  conversationId,
  user,
  onSelectUser,
}: UserSearchListItemProps) {
  const usernameLabel = getUsernameLabel(user.username);
  const displayName = getDisplayName(user);
  const actionLabel = getUserSearchActionLabel(
    user.statusFriend,
    conversationId,
  );

  return (
    <li>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-auto min-w-0 w-full justify-start overflow-hidden rounded-lg border-border/80 bg-background p-2 text-left whitespace-normal shadow-none",
          "hover:border-primary/50 hover:bg-muted/50",
        )}
        disabled={user.statusFriend === FriendStatus.SELF}
        onClick={() => {
          onSelectUser(user);
        }}
      >
        <div className="flex min-h-12 min-w-0 w-full items-center gap-3">
          <UserItemAvatar
            compact
            displayName={displayName}
            avatarUrl={user.avatarUrl ?? undefined}
          />
          <div className="min-w-0 flex-1 py-1">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="m-0 min-w-0 flex-1 truncate text-sm font-medium">
                {displayName}
              </p>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {actionLabel}
              </span>
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              {usernameLabel ? (
                <p className="m-0 min-w-0 flex-1 truncate">{usernameLabel}</p>
              ) : null}
              <p className="m-0 shrink-0">
                {getUserSearchStatusLabel(user.statusFriend)}
              </p>
            </div>
          </div>
        </div>
      </Button>
    </li>
  );
}
