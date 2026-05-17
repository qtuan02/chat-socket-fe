import { Loader2 } from "lucide-react";
import { UserItem } from "@/components/shared/user-item";
import { Button } from "@/components/ui/button";
import {
  type ConversationMember,
  ParticipantRole,
  participantRoleLabels,
} from "@/types/conversation";
import { getMemberPresenceLabel } from "@/utils/display";

type GroupMembersSectionProps = {
  members: ConversationMember[];
  isCurrentUserAdmin: boolean;
  currentUserId?: string | null;
  removingMemberId?: string | null;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  sendingFriendRequestId?: string | null;
  onRemoveMember?: (memberId: string) => void;
};

export function GroupMembersSection({
  members,
  isCurrentUserAdmin,
  currentUserId,
  onRemoveMember,
  removingMemberId,
  onSendFriendRequest,
  sendingFriendRequestId,
}: GroupMembersSectionProps) {
  return (
    <div className="grid gap-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Group members
      </p>
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No member list available.
        </p>
      ) : (
        <ul className="grid gap-2">
          {members.map((member) => {
            const isSelf = member.userId === currentUserId;
            const isRemovable =
              isCurrentUserAdmin &&
              !isSelf &&
              member.role !== ParticipantRole.Admin;
            const isRemoving = removingMemberId === member.id;
            const removeAction = isRemovable ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  onRemoveMember?.(member.id);
                }}
                disabled={isRemoving}
                aria-label={`Remove ${member.displayName} from group`}
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </Button>
            ) : null;

            const roleLabel = member.role
              ? participantRoleLabels[member.role]
              : participantRoleLabels[ParticipantRole.Member];

            return (
              <UserItem
                key={member.id}
                action={removeAction}
                isActionLoading={sendingFriendRequestId === member.id}
                user={{
                  id: member.id,
                  displayName: member.displayName,
                  username: member.username ?? undefined,
                  avatarUrl:
                    member.avatarUrl === null ? undefined : member.avatarUrl,
                  presenceStatus: member.presenceStatus,
                  joinedAt: member.joinedAt,
                  bio: member.bio ?? undefined,
                }}
                compact
                onSendFriendRequest={onSendFriendRequest}
                subtitle={`${roleLabel} - ${getMemberPresenceLabel(member)}`}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
