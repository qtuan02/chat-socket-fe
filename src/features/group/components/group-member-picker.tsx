import { Loader2, Search, X } from "lucide-react";
import { UserItemAvatar } from "@/components/shared/user-item-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGroupMemberPicker } from "@/features/group/hooks/use-group-member-picker";
import type { Friend } from "@/types/friend";
import { cn } from "@/utils/cn";
import { getDisplayName, getUsernameLabel } from "@/utils/display";

type GroupMemberPickerProps = {
  disabledFriendIds?: ReadonlySet<string> | string[];
  error?: string | null;
  isSubmitting?: boolean;
  selectedFriendIds: readonly string[];
  onChange: (nextMemberIds: string[]) => void;
};

function getMemberLabel(member: Friend) {
  return getDisplayName(member);
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
        <div className="h-14 animate-pulse rounded-lg bg-muted" />
        <div className="h-14 animate-pulse rounded-lg bg-muted" />
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
  const displayName = getDisplayName(friend);

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-1 text-xs">
      <UserItemAvatar
        compact
        displayName={displayName}
        avatarUrl={friend.avatarUrl ?? undefined}
      />
      <span className="max-w-[12rem] truncate">{displayName}</span>
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
  const displayName = getDisplayName(friend);

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
            displayName={displayName}
            avatarUrl={friend.avatarUrl ?? undefined}
            avatarSizeClassName="size-7"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-5">
              {displayName}
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
  const {
    searchInputId,
    searchTerm,
    friends,
    listRef,
    selectedFriendsById,
    disabledIdSet,
    selectedIdSet,
    isLoading,
    isError,
    isFetchingNextPage,
    searchErrorMessage,
    visibleSelectedFriendIds,
    handleSearchTermChange,
    handleListScroll,
    handleToggleMember,
    handleRemoveSelected,
    refetch,
  } = useGroupMemberPicker({
    disabledFriendIds,
    selectedFriendIds,
    onChange,
  });

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
        isLoading={isLoading}
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
