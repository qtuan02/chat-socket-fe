import { MessageCircle } from "lucide-react";
import { UserItem } from "@/components/shared/user-item";
import { Button } from "@/components/ui/button";
import type { Friend } from "@/types/friend";
import { FriendRelationshipStatusEnum } from "@/types/friend-status";
import type { UserItemData } from "@/types/user";
import { getErrorMessage } from "@/utils/error";

type FriendListProps = {
  friendInfoError: unknown;
  friends: Friend[];
  isFriendInfoLoading: boolean;
  processingFriendId: string | null;
  selectedFriendInfo?: UserItemData;
  selectedFriendInfoId: string | null;
  onMessageFriend: (friend: Friend) => void;
  onOpenFriendDetails: (friendId: string) => void;
  onUnfriend: (friendId: string) => void;
};

function getFriendDetailUser({
  friend,
  selectedFriendInfo,
  selectedFriendInfoId,
}: {
  friend: Friend;
  selectedFriendInfo?: UserItemData;
  selectedFriendInfoId: string | null;
}) {
  if (selectedFriendInfoId !== friend.id || !selectedFriendInfo) return null;

  return {
    ...selectedFriendInfo,
    presenceStatus: selectedFriendInfo.presenceStatus ?? friend.presenceStatus,
  };
}

export function FriendList({
  friendInfoError,
  friends,
  isFriendInfoLoading,
  processingFriendId,
  selectedFriendInfo,
  selectedFriendInfoId,
  onMessageFriend,
  onOpenFriendDetails,
  onUnfriend,
}: FriendListProps) {
  return (
    <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {friends.map((friend) => {
        const isSelected = selectedFriendInfoId === friend.id;
        const detailUser = getFriendDetailUser({
          friend,
          selectedFriendInfo,
          selectedFriendInfoId,
        });

        return (
          <UserItem
            key={friend.id}
            compact
            friendStatus={FriendRelationshipStatusEnum.Friend}
            user={{
              id: friend.id,
              displayName: friend.displayName,
              username: friend.username,
              avatarUrl: friend.avatarUrl,
              bio: friend.bio,
              joinedAt: friend.joinedAt,
              presenceStatus: friend.presenceStatus,
            }}
            detailUser={detailUser}
            detailErrorMessage={
              isSelected && friendInfoError
                ? getErrorMessage(
                    friendInfoError,
                    "Unable to load friend details.",
                  )
                : null
            }
            dialogAction={
              <Button
                type="button"
                variant="default"
                className="w-full"
                onClick={() => {
                  onMessageFriend(friend);
                }}
              >
                <MessageCircle className="size-4" />
                Message
              </Button>
            }
            isActionLoading={processingFriendId === friend.id}
            isDetailLoading={isSelected && isFriendInfoLoading}
            onOpenDetails={onOpenFriendDetails}
            onUnfriend={onUnfriend}
          />
        );
      })}
    </ul>
  );
}
