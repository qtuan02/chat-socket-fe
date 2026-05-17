import { ArrowLeft, Search } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFriendsQuery } from "@/hooks/api/friend";
import type { Friend } from "@/types/friend";
import { getErrorMessage } from "@/utils/error";
import { FriendSearchListItem } from "./friend-search-list-item";

type FriendSearchListProps = {
  conversationIdByFriendId: ReadonlyMap<string, string>;
  onBack: () => void;
  onSelectFriend: (friend: Friend) => void;
};

type FriendSearchResultsProps = {
  conversationIdByFriendId: ReadonlyMap<string, string>;
  error: unknown;
  friends: Friend[];
  isError: boolean;
  isLoading: boolean;
  searchTerm: string;
  onRetry: () => void;
  onSelectFriend: (friend: Friend) => void;
};

const FRIEND_SEARCH_LIMIT = 50;

function FriendSearchResults({
  conversationIdByFriendId,
  error,
  friends,
  isError,
  isLoading,
  searchTerm,
  onRetry,
  onSelectFriend,
}: FriendSearchResultsProps) {
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

export function FriendSearchList({
  conversationIdByFriendId,
  onBack,
  onSelectFriend,
}: FriendSearchListProps) {
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
