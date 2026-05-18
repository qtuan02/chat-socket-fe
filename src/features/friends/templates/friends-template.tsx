import { FriendRequestSection } from "../components/friend-request-section";
import { FriendsSection } from "../components/friends-section";
import { useFriendsTemplate } from "../hooks/use-friends-template";

export function FriendsTemplate() {
  const { friendDetails, friends, requests } = useFriendsTemplate();

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
            isFetchingNextPage={friends.isFetchingNextPage}
            hasNextPage={friends.hasNextPage}
            isError={friends.isError}
            error={friends.error}
            friendInfoError={friendDetails.error}
            friends={friends.messages}
            selectedFriendInfo={friendDetails.selectedFriendInfo}
            selectedFriendInfoId={friendDetails.selectedFriendInfoId}
            searchTerm={friends.searchTerm}
            onSearchChange={friends.setSearchTerm}
            onLoadMore={() => {
              void friends.fetchNextPage();
            }}
            onRetry={() => {
              void friends.refetch();
            }}
            processingFriendId={friendDetails.processingFriendId}
            isFriendInfoLoading={friendDetails.isLoading}
            onOpenFriendDetails={friendDetails.open}
            onMessageFriend={friendDetails.message}
            onUnfriend={friendDetails.unfriend}
          />
        </div>
      </section>
    </section>
  );
}
