import { Loader2, Search, X } from "lucide-react";
import * as React from "react";
import { UserItemAvatar } from "@/components/shared/user-item-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFriendsInfiniteQuery } from "@/hooks/api/friend";
import type { Friend } from "@/types/friend";
import { cn } from "@/utils/cn";
import { getUsernameLabel } from "@/utils/display";
import { getErrorMessage } from "@/utils/error";

const GROUP_MEMBER_PICKER_LIMIT = 25;

type GroupMemberPickerProps = {
  disabledFriendIds?: ReadonlySet<string> | string[];
  error?: string | null;
  isSubmitting?: boolean;
  selectedFriendIds: readonly string[];
  onChange: (nextMemberIds: string[]) => void;
};

function getDisabledIdSet(disabledFriendIds: ReadonlySet<string> | string[]) {
  return disabledFriendIds instanceof Set
    ? disabledFriendIds
    : new Set(disabledFriendIds);
}

function normalizeFriendIds(friendIds: readonly string[]) {
  return new Set(friendIds);
}

function getMemberLabel(member: Friend) {
  return member.displayName || member.username || member.id;
}

function SearchState({
  friends,
  hasError,
  isLoading,
  searchTerm,
}: {
  friends: Friend[];
  hasError: boolean;
  isLoading: boolean;
  searchTerm: string;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-2">
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
      </div>
    );
  }

  if (hasError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        {searchTerm
          ? `Unable to search friends with "${searchTerm}".`
          : "Unable to load friends."}
      </p>
    );
  }

  if (friends.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
        {searchTerm ? "No friends match this search." : "No friends found."}
      </p>
    );
  }

  return null;
}

function SelectedFriendChip({
  friend,
  onRemove,
}: {
  friend: Friend;
  onRemove: (friendId: string) => void;
}) {
  const username = getUsernameLabel(friend.username);

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-1 text-xs">
      <UserItemAvatar
        compact
        displayName={friend.displayName}
        avatarUrl={friend.avatarUrl}
      />
      <span className="max-w-[12rem] truncate">{friend.displayName}</span>
      {username ? (
        <span className="text-muted-foreground">{username}</span>
      ) : null}
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        onClick={() => {
          onRemove(friend.id);
        }}
        className="ml-1 size-5 rounded-full p-0.5 hover:bg-muted [&_svg:not([class*='size-'])]:size-3"
        aria-label={`Remove ${getMemberLabel(friend)}`}
      >
        <X className="size-3" />
      </Button>
    </span>
  );
}

function FriendListItem({
  friend,
  isDisabled,
  isSelected,
  isSubmitting,
  onToggle,
}: {
  friend: Friend;
  isDisabled: boolean;
  isSelected: boolean;
  isSubmitting: boolean;
  onToggle: (friend: Friend) => void;
}) {
  const username = getUsernameLabel(friend.username);

  return (
    <li>
      <div
        className={cn(
          "rounded-md border border-border/80 bg-background px-2 py-1.5",
          isSelected && "border-primary/40 bg-primary/5",
          isDisabled && "opacity-80",
        )}
      >
        <div className="flex min-h-10 items-center gap-2">
          <UserItemAvatar
            compact
            displayName={friend.displayName}
            avatarUrl={friend.avatarUrl}
            avatarSizeClassName="size-7"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-5">
              {friend.displayName}
            </p>
            {username ? (
              <p className="truncate text-xs leading-4 text-muted-foreground">
                {username}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            variant={
              isDisabled ? "outline" : isSelected ? "secondary" : "outline"
            }
            className="h-7 shrink-0 px-2 text-xs"
            onClick={() => {
              onToggle(friend);
            }}
            disabled={isDisabled || isSubmitting}
          >
            {isSelected ? "Remove" : "Add"}
          </Button>
        </div>
      </div>
    </li>
  );
}

export function GroupMemberPicker({
  disabledFriendIds,
  error,
  isSubmitting = false,
  selectedFriendIds,
  onChange,
}: GroupMemberPickerProps) {
  const searchInputId = React.useId();
  const [searchTerm, setSearchTerm] = React.useState("");
  const trimmedSearchTerm = searchTerm.trim();
  const [selectedFriendsById, setSelectedFriendsById] = React.useState<
    Map<string, Friend>
  >(new Map());
  const disabledIdSet = React.useMemo(() => {
    if (!disabledFriendIds) return new Set<string>();
    return getDisabledIdSet(disabledFriendIds);
  }, [disabledFriendIds]);
  const selectedIdSet = React.useMemo(
    () => normalizeFriendIds(selectedFriendIds),
    [selectedFriendIds],
  );
  const {
    friends,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useFriendsInfiniteQuery({
    search: trimmedSearchTerm || undefined,
    limit: GROUP_MEMBER_PICKER_LIMIT,
  });
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSelectedFriendsById((currentMap) => {
      const nextMap = new Map(currentMap);

      for (const friend of friends) {
        if (selectedIdSet.has(friend.id)) {
          nextMap.set(friend.id, friend);
        }
      }

      for (const memberId of currentMap.keys()) {
        if (!selectedIdSet.has(memberId)) nextMap.delete(memberId);
      }

      return nextMap;
    });
  }, [friends, selectedIdSet]);

  const handleSearchTermChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
  };

  const handleListScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const remainingScroll =
        target.scrollHeight - target.scrollTop - target.clientHeight;

      if (
        remainingScroll > 64 ||
        !hasNextPage ||
        isFetchingNextPage ||
        isLoading ||
        isError
      )
        return;

      void fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isError, isFetchingNextPage, isLoading],
  );

  const handleToggleMember = React.useCallback(
    (friend: Friend) => {
      const nextIds = new Set(selectedFriendIds);
      if (nextIds.has(friend.id)) {
        nextIds.delete(friend.id);
      } else if (!disabledIdSet.has(friend.id)) {
        nextIds.add(friend.id);
      }

      onChange(Array.from(nextIds));
      setSelectedFriendsById((currentMap) => {
        const nextMap = new Map(currentMap);

        if (nextIds.has(friend.id)) nextMap.set(friend.id, friend);
        else nextMap.delete(friend.id);

        return nextMap;
      });
    },
    [disabledIdSet, onChange, selectedFriendIds],
  );

  const handleRemoveSelected = React.useCallback(
    (friendId: string) => {
      const nextIds = selectedFriendIds.filter((id) => id !== friendId);

      onChange(nextIds);
      setSelectedFriendsById((currentMap) => {
        const nextMap = new Map(currentMap);
        nextMap.delete(friendId);
        return nextMap;
      });
    },
    [onChange, selectedFriendIds],
  );

  const visibleSelectedFriendIds = React.useMemo(
    () => selectedFriendIds.filter((id) => !disabledIdSet.has(id)),
    [disabledIdSet, selectedFriendIds],
  );
  const searchErrorMessage =
    isError && queryError
      ? getErrorMessage(queryError, "Failed to load friends.")
      : null;

  return (
    <div className="grid gap-3">
      <label
        className="grid gap-1"
        htmlFor={`group-member-search-${searchInputId}`}
      >
        <span className="text-sm font-medium">Search friends</span>
        <div className="relative text-muted-foreground">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4" />
          <Input
            id={`group-member-search-${searchInputId}`}
            value={searchTerm}
            onChange={(event) => {
              handleSearchTermChange(event.target.value);
            }}
            placeholder="Search by name or username"
            type="search"
            className="h-9 pl-9 pr-9"
            disabled={isSubmitting}
          />
        </div>
      </label>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          Selected members
        </p>
        {visibleSelectedFriendIds.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members selected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleSelectedFriendIds.map((friendId) => {
              const friend = selectedFriendsById.get(friendId);
              if (!friend) return null;

              return (
                <SelectedFriendChip
                  key={friendId}
                  friend={friend}
                  onRemove={handleRemoveSelected}
                />
              );
            })}
          </div>
        )}
      </div>

      <SearchState
        friends={friends}
        hasError={!!searchErrorMessage}
        isLoading={isLoading || isRefetching}
        searchTerm={searchTerm}
      />

      <div
        ref={listRef}
        onScroll={handleListScroll}
        className="min-h-0 max-h-64 overflow-y-auto pr-1"
      >
        {isError && (
          <div className="grid gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mx-auto w-full sm:w-auto"
              onClick={() => {
                void refetch();
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError ? (
          <ul className="grid gap-2">
            {friends.map((friend) => {
              const isDisabled = disabledIdSet.has(friend.id);
              const isSelected = selectedIdSet.has(friend.id);

              return (
                <FriendListItem
                  key={friend.id}
                  friend={friend}
                  isDisabled={isDisabled}
                  isSelected={isSelected}
                  isSubmitting={isSubmitting}
                  onToggle={handleToggleMember}
                />
              );
            })}

            {isFetchingNextPage ? (
              <li className="py-2">
                <div className="flex justify-center">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
