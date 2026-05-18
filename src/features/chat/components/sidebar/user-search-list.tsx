import { ArrowLeft, Search } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSearchInfiniteQuery } from "@/hooks/api/user";
import type { UserSearch } from "@/types/user";
import { getErrorMessage } from "@/utils/error";
import { UserSearchListItem } from "./user-search-list-item";

type UserSearchListProps = {
  conversationIdByUserId: ReadonlyMap<string, string>;
  onBack: () => void;
  onSelectUser: (user: UserSearch) => void;
};

type UserSearchResultsProps = {
  conversationIdByUserId: ReadonlyMap<string, string>;
  error: unknown;
  hasNextPage: boolean;
  hasSearchTerm: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  users: UserSearch[];
  onLoadMore: () => void;
  onRetry: () => void;
  onSelectUser: (user: UserSearch) => void;
};

const USER_SEARCH_LIMIT = 50;

function UserSearchResults({
  conversationIdByUserId,
  error,
  hasNextPage,
  hasSearchTerm,
  isError,
  isFetchingNextPage,
  isLoading,
  users,
  onLoadMore,
  onRetry,
  onSelectUser,
}: UserSearchResultsProps) {
  if (!hasSearchTerm) {
    return (
      <p className="m-0 rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
        Search users by name or username to start a direct message.
      </p>
    );
  }

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
          {getErrorMessage(error, "Unable to search users.")}
        </p>
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className="m-0 rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
        No users match this search.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      <ul className="grid gap-2">
        {users.map((user) => (
          <UserSearchListItem
            key={user.id}
            user={user}
            conversationId={conversationIdByUserId.get(user.id)}
            onSelectUser={onSelectUser}
          />
        ))}
      </ul>

      {hasNextPage ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          disabled={isFetchingNextPage}
          onClick={onLoadMore}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}

export function UserSearchList({
  conversationIdByUserId,
  onBack,
  onSelectUser,
}: UserSearchListProps) {
  const searchInputId = React.useId();
  const [searchTerm, setSearchTerm] = React.useState("");
  const trimmedSearchTerm = searchTerm.trim();
  const userSearchQuery = useUserSearchInfiniteQuery({
    limit: USER_SEARCH_LIMIT,
    search: trimmedSearchTerm,
  });
  const users =
    userSearchQuery.data?.pages.flatMap((page) => page.messages) ?? [];

  return (
    <section className="flex h-full min-h-0 flex-col">
      <label className="mb-3 block" htmlFor={`user-search-${searchInputId}`}>
        <span className="sr-only">Search users</span>
        <div className="relative text-muted-foreground">
          <Search className="pointer-events-none absolute left-3 top-2 size-4" />
          <Input
            id={`user-search-${searchInputId}`}
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
        <h2 className="text-sm font-semibold">Users</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <UserSearchResults
          conversationIdByUserId={conversationIdByUserId}
          error={userSearchQuery.error}
          hasNextPage={userSearchQuery.hasNextPage}
          hasSearchTerm={trimmedSearchTerm.length > 0}
          isError={userSearchQuery.isError}
          isFetchingNextPage={userSearchQuery.isFetchingNextPage}
          isLoading={userSearchQuery.isLoading}
          users={users}
          onLoadMore={() => {
            void userSearchQuery.fetchNextPage();
          }}
          onRetry={() => {
            void userSearchQuery.refetch();
          }}
          onSelectUser={onSelectUser}
        />
      </div>
    </section>
  );
}
