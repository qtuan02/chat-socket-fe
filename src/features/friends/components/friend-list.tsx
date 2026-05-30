import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserItem } from "@/features/friends/templates/user-item-template";
import type { FriendWithPresence } from "@/types/friend";
import { FriendStatus } from "@/types/friend-status";
import type { UserInfo } from "@/types/user";
import { getErrorMessage } from "@/utils/error";

type FriendListProps = {
  friendInfoError: unknown;
  friends: FriendWithPresence[];
  isFriendInfoLoading: boolean;
  processingFriendId: string | null;
  selectedFriendInfo?: UserInfo;
  selectedFriendInfoId: string | null;
  onMessageFriend: (friend: FriendWithPresence) => void;
  onOpenFriendDetails: (friendId: string) => void;
  onUnfriend: (friendId: string) => void;
};

function getFriendDetailUser({
  friend,
  selectedFriendInfo,
  selectedFriendInfoId,
}: {
  friend: FriendWithPresence;
  selectedFriendInfo?: UserInfo;
  selectedFriendInfoId: string | null;
}) {
  if (selectedFriendInfoId !== friend.id || !selectedFriendInfo) return null;

  return {
    ...selectedFriendInfo,
    presenceStatus: friend.presenceStatus,
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
            friendStatus={FriendStatus.FRIEND}
            user={friend}
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
