import { AddFriendDialog } from "@/features/friends/components/add-friend-dialog";
import { FriendRequestSection } from "../components/friend-request-section";
import { FriendsSection } from "../components/friends-section";
import { useFriendsTemplate } from "../hooks/use-friends-template";

export function FriendsTemplate() {
  const friendsState = useFriendsTemplate();

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/50">
      <section className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 p-4 md:p-6">
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <h1 className="text-lg font-semibold">Friends</h1>
          <p className="text-xs text-muted-foreground">
            Manage friend requests and your contact list.
          </p>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 md:gap-5">
          <FriendRequestSection
            isLoading={friendsState.isRequestsLoading}
            isError={friendsState.isFriendRequestsError}
            error={friendsState.friendRequestsError}
            receivedRequests={friendsState.receivedRequests}
            sentRequests={friendsState.sentRequests}
            processingRequestId={friendsState.processingRequestId}
            onAccept={friendsState.handleAcceptFriendRequest}
            onDecline={friendsState.handleDeclineFriendRequest}
            onCancelSentRequest={friendsState.handleCancelFriendRequest}
            onRetry={() => {
              void friendsState.refetchFriendRequests();
            }}
          />

          <FriendsSection
            isLoading={friendsState.isFriendsLoading}
            isError={friendsState.isFriendsError}
            error={friendsState.friendsError}
            friends={friendsState.friends}
            searchTerm={friendsState.friendSearchTerm}
            onSearchChange={friendsState.setFriendSearchTerm}
            onRetry={() => {
              void friendsState.refetchFriends();
            }}
            processingFriendId={friendsState.processingFriendId}
            onUnfriend={friendsState.handleUnfriend}
            onAddFriend={friendsState.handleOpenAddFriend}
          />
        </div>
      </section>
      <AddFriendDialog
        isOpen={friendsState.addFriendDialogState.isOpen}
        hasSearched={friendsState.addFriendDialogState.hasSearched}
        isSearching={friendsState.searching}
        isSendingRequest={friendsState.sendingRequest}
        lastSearchTerm={friendsState.addFriendDialogState.lastSearchTerm}
        searchError={friendsState.searchError}
        searchResults={friendsState.addFriendDialogState.results}
        sendingFriendId={friendsState.sendingFriendId}
        onOpenChange={friendsState.handleCloseAddFriend}
        onSearch={friendsState.handleSearchUser}
        onSendRequest={friendsState.handleSendFriendRequest}
      />
    </section>
  );
}
