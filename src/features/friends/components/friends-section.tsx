import { Search, UserPlus } from "lucide-react";
import * as React from "react";
import { UserItem } from "@/components/shared/user-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Friend } from "@/types/friend";
import { FriendRelationshipStatusEnum } from "@/types/friend-status";
import { getErrorMessage } from "@/utils/error";

type FriendsSectionProps = {
  className?: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  friends: Friend[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRetry: () => void;
  onAddFriend: () => void;
  processingFriendId: string | null;
  onUnfriend: (friendId: string) => void;
};

function filterFriends(friends: Friend[], searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) return friends;

  return friends.filter((friend) =>
    [friend.displayName, friend.username]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

export function FriendsSection({
  className,
  isLoading,
  isError,
  error,
  friends,
  searchTerm,
  onSearchChange,
  onRetry,
  onAddFriend,
  processingFriendId,
  onUnfriend,
}: FriendsSectionProps) {
  const searchInputId = React.useId();
  const visibleFriends = React.useMemo(
    () => filterFriends(friends, searchTerm),
    [friends, searchTerm],
  );

  return (
    <section
      className={
        className ??
        "flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-background/60"
      }
    >
      <div className="border-b border-border px-4 py-3">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Friends</h2>
            <p className="text-xs text-muted-foreground">
              Connect with your existing friends.
            </p>
          </div>
          <Button type="button" size="sm" onClick={onAddFriend}>
            <UserPlus className="size-4" />
            Add Friend
          </Button>
        </div>

        <label className="block" htmlFor={`friends-search-${searchInputId}`}>
          <span className="sr-only">Search friends</span>
          <div className="relative text-muted-foreground">
            <Search className="pointer-events-none absolute left-3 top-2 size-4" />
            <Input
              id={`friends-search-${searchInputId}`}
              value={searchTerm}
              onChange={(event) => {
                onSearchChange(event.target.value);
              }}
              placeholder="Search by name or username"
              type="search"
              className="h-9 pl-9 pr-3"
            />
          </div>
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {isLoading && (
          <div className="grid gap-2">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
            <p className="m-0 mb-2 text-destructive">
              {getErrorMessage(error, "Unable to load friends.")}
            </p>
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && visibleFriends.length === 0 && (
          <p className="m-0 rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
            {searchTerm
              ? "No matching friends in this list."
              : "No friends added yet."}
          </p>
        )}

        {!isLoading && !isError && visibleFriends.length > 0 ? (
          <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {visibleFriends.map((friend) => (
              <UserItem
                key={friend.id}
                compact
                friendStatus={FriendRelationshipStatusEnum.Friend}
                user={{
                  id: friend.id,
                  displayName: friend.displayName,
                  username: friend.username,
                  avatarUrl: friend.avatarUrl,
                  bio: friend.bio,
                  joinedAt: friend.joinedAt,
                  presenceStatus: friend.presenceStatus,
                }}
                isActionLoading={processingFriendId === friend.id}
                onUnfriend={onUnfriend}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
