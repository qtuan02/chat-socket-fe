import { AddFriendDialog } from "@/features/friends/components/add-friend-dialog";
import { FriendRequestSection } from "../components/friend-request-section";
import { FriendsSection } from "../components/friends-section";
import { useFriendsTemplate } from "../hooks/use-friends-template";

export function FriendsTemplate() {
  const { addFriend, friendDetails, friends, requests } = useFriendsTemplate();

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-muted/50 md:pb-0 md:overflow-hidden">
      <section className="mx-auto flex min-h-0 flex-1 w-full max-w-5xl flex-col gap-4 p-3 md:p-6">
        <div className="grid min-h-0 flex-1 gap-4 md:gap-5 h-full">
          <FriendRequestSection
            isLoading={requests.isLoading}
            isError={requests.isError}
            error={requests.error}
            receivedRequests={requests.received}
            sentRequests={requests.sent}
            processingRequestId={requests.processingRequestId}
            onAccept={requests.accept}
            onDecline={requests.decline}
            onCancelSentRequest={requests.cancel}
            onRetry={() => {
              void requests.refetch();
            }}
          />

          <FriendsSection
            isLoading={friends.isLoading}
            isError={friends.isError}
            error={friends.error}
            friendInfoError={friendDetails.error}
            friends={friends.items}
            selectedFriendInfo={friendDetails.selectedFriendInfo}
            selectedFriendInfoId={friendDetails.selectedFriendInfoId}
            searchTerm={friends.searchTerm}
            onSearchChange={friends.setSearchTerm}
            onRetry={() => {
              void friends.refetch();
            }}
            processingFriendId={friendDetails.processingFriendId}
            isFriendInfoLoading={friendDetails.isLoading}
            onOpenFriendDetails={friendDetails.open}
            onMessageFriend={friendDetails.message}
            onUnfriend={friendDetails.unfriend}
            onAddFriend={addFriend.open}
          />
        </div>
      </section>
      <AddFriendDialog
        isOpen={addFriend.state.isOpen}
        hasSearched={addFriend.state.hasSearched}
        isSearching={addFriend.isSearching}
        isSendingRequest={addFriend.isSendingRequest}
        lastSearchTerm={addFriend.state.lastSearchTerm}
        searchError={addFriend.searchError}
        searchResults={addFriend.state.results}
        sendingFriendId={addFriend.sendingFriendId}
        onOpenChange={addFriend.setOpen}
        onSearch={addFriend.search}
        onSendRequest={addFriend.sendRequest}
      />
    </section>
  );
}
