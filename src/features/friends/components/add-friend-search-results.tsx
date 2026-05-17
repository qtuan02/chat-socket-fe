import { UserItem } from "@/components/shared/user-item";
import type { FriendSearchResult } from "@/types/friend";
import { getErrorMessage } from "@/utils/error";

type AddFriendSearchResultsProps = {
  hasSearched: boolean;
  isSearching: boolean;
  lastSearchTerm: string;
  searchError: unknown;
  searchResults: FriendSearchResult[];
  sendingFriendId: string | null;
  onSendRequest: (toUserId: string) => void;
};

export function AddFriendSearchResults({
  hasSearched,
  isSearching,
  lastSearchTerm,
  searchError,
  searchResults,
  sendingFriendId,
  onSendRequest,
}: AddFriendSearchResultsProps) {
  if (isSearching) {
    return <p className="text-xs text-muted-foreground">Searching...</p>;
  }

  if (hasSearched && searchError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
        {getErrorMessage(searchError, "Unable to search users.")}
      </p>
    );
  }

  if (hasSearched && searchResults.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        {lastSearchTerm
          ? `No users found for ${lastSearchTerm}.`
          : "No users found."}
      </p>
    );
  }

  if (searchResults.length === 0) return null;

  return (
    <ul className="grid gap-2">
      {searchResults.map((result) => (
        <UserItem
          key={result.id}
          compact
          user={{
            id: result.id,
            displayName: result.displayName,
            username: result.username,
            avatarUrl: result.avatarUrl,
            bio: result.bio,
          }}
          friendStatus={result.friendshipStatus}
          isActionLoading={sendingFriendId === result.id}
          onSendFriendRequest={onSendRequest}
        />
      ))}
    </ul>
  );
}
