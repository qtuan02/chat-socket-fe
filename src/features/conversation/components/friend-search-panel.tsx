import { ArrowLeft, Search } from "lucide-react";
import * as React from "react";
import { UserItemAvatar } from "@/components/shared/user-item-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFriendsQuery } from "@/hooks/api/friend";
import type { Friend } from "@/types/friend";
import { PresenceStatusEnum, presenceStatusLabels } from "@/types/user";
import { cn } from "@/utils/cn";
import { getErrorMessage } from "@/utils/error";
import { getUsernameLabel } from "@/utils/user-display";

type FriendSearchPanelProps = {
  conversationIdByFriendId: ReadonlyMap<string, string>;
  onBack: () => void;
  onSelectFriend: (friend: Friend) => void;
};

const FRIEND_SEARCH_LIMIT = 50;

function getFriendPresenceLabel(friend: Friend) {
  const presenceStatus = friend.presenceStatus ?? PresenceStatusEnum.Checking;

  return (
    presenceStatusLabels[presenceStatus] ??
    presenceStatusLabels[PresenceStatusEnum.Checking]
  );
}

function FriendSearchListItem({
  conversationId,
  friend,
  onSelectFriend,
}: {
  conversationId?: string;
  friend: Friend;
  onSelectFriend: (friend: Friend) => void;
}) {
  const usernameLabel = getUsernameLabel(friend.username);
  const presenceStatus = friend.presenceStatus ?? PresenceStatusEnum.Checking;
  const presenceLabel = getFriendPresenceLabel(friend);
  const content = (
    <div className="flex min-h-12 items-center gap-3">
      <UserItemAvatar
        compact
        displayName={friend.displayName}
        avatarUrl={friend.avatarUrl}
        presenceStatus={presenceStatus}
      />
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 truncate text-sm font-medium">
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
          <p className="m-0 shrink-0">{presenceLabel}</p>
        </div>
      </div>
    </div>
  );

  return (
    <li>
      <button
        type="button"
        className={cn(
          "w-full rounded-lg border border-border/80 bg-background p-2 text-left transition",
          "hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
        onClick={() => {
          onSelectFriend(friend);
        }}
      >
        {content}
      </button>
    </li>
  );
}

function FriendSearchResults({
  conversationIdByFriendId,
  error,
  friends,
  isError,
  isLoading,
  searchTerm,
  onRetry,
  onSelectFriend,
}: {
  conversationIdByFriendId: ReadonlyMap<string, string>;
  error: unknown;
  friends: Friend[];
  isError: boolean;
  isLoading: boolean;
  searchTerm: string;
  onRetry: () => void;
  onSelectFriend: (friend: Friend) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-2">
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
        <p className="m-0 mb-2 text-destructive">
          {getErrorMessage(error, "Unable to load friends.")}
        </p>
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <p className="m-0 rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
        {searchTerm ? "No friends match this search." : "No friends added yet."}
      </p>
    );
  }

  return (
    <ul className="grid gap-2">
      {friends.map((friend) => (
        <FriendSearchListItem
          key={friend.id}
          friend={friend}
          conversationId={conversationIdByFriendId.get(friend.id)}
          onSelectFriend={onSelectFriend}
        />
      ))}
    </ul>
  );
}

export function FriendSearchPanel({
  conversationIdByFriendId,
  onBack,
  onSelectFriend,
}: FriendSearchPanelProps) {
  const searchInputId = React.useId();
  const [searchTerm, setSearchTerm] = React.useState("");
  const trimmedSearchTerm = searchTerm.trim();
  const friendsQuery = useFriendsQuery(
    {
      limit: FRIEND_SEARCH_LIMIT,
      search: trimmedSearchTerm || undefined,
    },
    {
      staleTime: 30_000,
    },
  );

  return (
    <section className="flex h-full min-h-0 flex-col">
      <label className="mb-3 block" htmlFor={`friend-search-${searchInputId}`}>
        <span className="sr-only">Search friends</span>
        <div className="relative text-muted-foreground">
          <Search className="pointer-events-none absolute left-3 top-2 size-4" />
          <Input
            id={`friend-search-${searchInputId}`}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                onBack();
              }
            }}
            placeholder="Search by name or username"
            type="search"
            autoFocus
            className="h-9 pl-9 pr-3"
          />
        </div>
      </label>

      <div className="mb-4 flex items-center gap-2">
        <Button type="button" size="icon-sm" variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back to conversations</span>
        </Button>
        <h2 className="text-sm font-semibold">Friends</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <FriendSearchResults
          conversationIdByFriendId={conversationIdByFriendId}
          error={friendsQuery.error}
          friends={friendsQuery.data?.items ?? []}
          isError={friendsQuery.isError}
          isLoading={friendsQuery.isLoading}
          searchTerm={trimmedSearchTerm}
          onRetry={() => {
            void friendsQuery.refetch();
          }}
          onSelectFriend={onSelectFriend}
        />
      </div>
    </section>
  );
}
