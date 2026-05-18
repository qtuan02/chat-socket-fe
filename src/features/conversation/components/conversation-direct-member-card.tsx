import { UserItem } from "@/components/shared/user-item";
import type { ConversationMember } from "@/types/conversation";
import type { UserInfo } from "@/types/user";

export function ConversationDirectMemberCard({
  member,
  detailUser,
  isDetailLoading = false,
  detailErrorMessage,
  onOpenDetails,
  onSendFriendRequest,
  sendingFriendRequestId,
}: {
  member: ConversationMember;
  detailUser?: UserInfo;
  isDetailLoading?: boolean;
  detailErrorMessage?: string | null;
  onOpenDetails?: (userId: string) => void;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  sendingFriendRequestId?: string | null;
}) {
  return (
    <UserItem
      compact
      user={{
        id: member.userId,
        displayName: member.displayName,
        username: member.username ?? undefined,
        avatarUrl: member.avatarUrl ?? undefined,
        bio: member.bio ?? undefined,
        joinedAt: member.joinedAt,
        presenceStatus: member.presenceStatus,
      }}
      detailUser={detailUser}
      friendStatus={detailUser?.statusFriend}
      isActionLoading={sendingFriendRequestId === member.userId}
      isDetailLoading={isDetailLoading}
      detailErrorMessage={detailErrorMessage}
      onOpenDetails={onOpenDetails}
      onSendFriendRequest={onSendFriendRequest}
    />
  );
}
