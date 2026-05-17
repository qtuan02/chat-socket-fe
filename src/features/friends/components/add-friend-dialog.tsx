import { Loader2, Search, UserRound } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
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
import { AddFriendSearchResults } from "./add-friend-search-results";

type AddFriendDialogProps = {
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
  onSendRequest: (toUserId: string) => void;
};

export function AddFriendDialog({
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
  const isBusy = isSearching || isSendingRequest;

  React.useEffect(() => {
    if (!isOpen) setUsername("");
  }, [isOpen]);

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
      <DialogContent>
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
          <AddFriendSearchResults
            hasSearched={hasSearched}
            isSearching={isSearching}
            lastSearchTerm={lastSearchTerm}
            searchError={searchError}
            searchResults={searchResults}
            sendingFriendId={sendingFriendId}
            onSendRequest={onSendRequest}
          />
        </div>

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
