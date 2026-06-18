import { MessageCircle } from "lucide-react";
import { UserItem } from "@/components/shared/user-item";
import { Button } from "@/components/ui/button";
import type { FriendWithPresence } from "@/types/friend";
import { FriendStatus } from "@/types/friend-status";

type FriendListProps = {
  friends: FriendWithPresence[];
  processingFriendId: string | null;
  onMessageFriend: (friend: FriendWithPresence) => void;
  onUnfriend: (friendId: string) => void;
};

export function FriendList({
  friends,
  processingFriendId,
  onMessageFriend,
  onUnfriend,
}: FriendListProps) {
  return (
    <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {friends.map((friend) => (
        <UserItem
          key={friend.id}
          compact
          friendStatus={FriendStatus.FRIEND}
          user={friend}
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
          onUnfriend={onUnfriend}
        />
      ))}
    </ul>
  );
}
