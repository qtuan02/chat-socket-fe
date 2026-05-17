import { AddFriendDialog } from "@/features/friends/components/add-friend-dialog";
import { FriendRequestSection } from "../components/friend-request-section";
import { FriendsSection } from "../components/friends-section";
import { useFriendsTemplate } from "../hooks/use-friends-template";

export function FriendsTemplate() {
  const friendsState = useFriendsTemplate();

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-muted/50 md:pb-0 md:overflow-hidden">
      <section className="mx-auto flex min-h-0 flex-1 w-full max-w-5xl flex-col gap-4 p-3 md:p-6">
        <div className="grid min-h-0 flex-1 gap-4 md:gap-5 h-full">
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
            friendInfoError={friendsState.friendInfoError}
            friends={friendsState.friends}
            selectedFriendInfo={friendsState.selectedFriendInfo}
            selectedFriendInfoId={friendsState.selectedFriendInfoId}
            searchTerm={friendsState.friendSearchTerm}
            onSearchChange={friendsState.setFriendSearchTerm}
            onRetry={() => {
              void friendsState.refetchFriends();
            }}
            processingFriendId={friendsState.processingFriendId}
            isFriendInfoLoading={friendsState.isFriendInfoLoading}
            onOpenFriendDetails={friendsState.handleOpenFriendDetails}
            onMessageFriend={friendsState.handleMessageFriend}
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
