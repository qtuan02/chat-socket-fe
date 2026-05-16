import { Loader2, Search, UserRound } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { UserItem } from "@/components/shared/user-item";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { FriendSearchResult } from "@/types/friend";
import { getErrorMessage } from "@/utils/error";

type AddFriendDialogProps = {
  className?: string;
  isOpen: boolean;
  hasSearched: boolean;
  isSearching: boolean;
  isSendingRequest: boolean;
  lastSearchTerm: string;
  searchError: unknown;
  searchResults: FriendSearchResult[];
  sendingFriendId: string | null;
  onOpenChange: (isOpen: boolean) => void;
  onSearch: (username: string) => void;
  onSendRequest: (toUserId: string, message?: string) => void;
};

export function AddFriendDialog({
  className,
  isOpen,
  hasSearched,
  isSearching,
  isSendingRequest,
  lastSearchTerm,
  searchError,
  searchResults,
  sendingFriendId,
  onOpenChange,
  onSearch,
  onSendRequest,
}: AddFriendDialogProps) {
  const [username, setUsername] = React.useState("");
  const [pendingInviteTarget, setPendingInviteTarget] =
    React.useState<FriendSearchResult | null>(null);
  const [requestMessage, setRequestMessage] = React.useState("");

  const isSendPopupOpen = Boolean(pendingInviteTarget);
  const isSelectedUserSending =
    pendingInviteTarget !== null &&
    isSendingRequest &&
    sendingFriendId === pendingInviteTarget.id;

  React.useEffect(() => {
    if (!isOpen) {
      setUsername("");
      setPendingInviteTarget(null);
      setRequestMessage("");
    }
  }, [isOpen]);

  const isBusy = isSearching || isSendingRequest;

  const handleSearch = () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      toast.error("Please enter a username before searching.");
      return;
    }

    onSearch(trimmedUsername);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>Add friend</DialogTitle>
          <DialogDescription>
            Search by username and send a friend request.
          </DialogDescription>
        </DialogHeader>

        <label className="block" htmlFor="friend-search-input">
          <span className="sr-only">Search users by username</span>
          <div className="relative text-muted-foreground">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4" />
            <Input
              id="friend-search-input"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (!isBusy) handleSearch();
                }
              }}
              placeholder="Enter username"
              type="search"
              className="h-9 pl-9 pr-10"
              disabled={isBusy}
            />
            <Button
              size="sm"
              type="button"
              onClick={handleSearch}
              disabled={isBusy}
              className="absolute right-1 top-1 h-7 px-2"
              variant="outline"
            >
              {isSearching ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Search className="size-3" />
              )}
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </label>

        <div className="grid gap-3">
          {isSearching && (
            <p className="text-xs text-muted-foreground">Searching...</p>
          )}

          {hasSearched && searchError && !isSearching ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {getErrorMessage(searchError, "Unable to search users.")}
            </p>
          ) : null}

          {hasSearched &&
          !isSearching &&
          !searchError &&
          searchResults.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {lastSearchTerm
                ? `No users found for ${lastSearchTerm}.`
                : "No users found."}
            </p>
          ) : null}

          {searchResults.length > 0 ? (
            <ul className="grid gap-2">
              {searchResults.map((result) => {
                const isSending =
                  isSendingRequest && sendingFriendId === result.id;

                return (
                  <li key={result.id}>
                    <UserItem
                      compact
                      user={{
                        id: result.id,
                        displayName: result.displayName,
                        username: result.username,
                        avatarUrl: result.avatarUrl,
                        bio: result.bio,
                      }}
                      friendStatus={result.friendshipStatus}
                      isActionLoading={isSending}
                      onSendFriendRequest={() => {
                        setRequestMessage("");
                        setPendingInviteTarget(result);
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <Dialog
          open={isSendPopupOpen}
          onOpenChange={(isNextOpen) => {
            if (!isNextOpen) {
              setPendingInviteTarget(null);
              setRequestMessage("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send friend request</DialogTitle>
              <DialogDescription>
                {pendingInviteTarget
                  ? `Add a message for ${pendingInviteTarget.displayName || pendingInviteTarget.username || "this user"}.`
                  : "Add a message to your request."}
              </DialogDescription>
            </DialogHeader>

            <label
              className="grid gap-1"
              htmlFor="friend-request-message-input"
            >
              <span className="text-sm font-medium">Message (optional)</span>
              <textarea
                id="friend-request-message-input"
                value={requestMessage}
                onChange={(event) => {
                  setRequestMessage(event.target.value);
                }}
                disabled={isSelectedUserSending}
                placeholder="Add a short note (max 300 characters)"
                className="min-h-20 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={300}
              />
            </label>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPendingInviteTarget(null);
                  setRequestMessage("");
                }}
                disabled={isSelectedUserSending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!pendingInviteTarget) return;

                  onSendRequest(
                    pendingInviteTarget.id,
                    requestMessage.trim() || undefined,
                  );
                }}
                disabled={isSelectedUserSending}
              >
                {isSelectedUserSending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isBusy}
          >
            <UserRound className="size-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
