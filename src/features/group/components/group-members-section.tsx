import { Loader2, UserMinus } from "lucide-react";
import { UserItem } from "@/components/shared/user-item";
import { Button } from "@/components/ui/button";
import {
  type ConversationMember,
  ParticipantRole,
  participantRoleLabels,
} from "@/types/conversation";

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
      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Members · {members.length}
      </p>
      {members.length === 0 ? (
        <p className="rounded-xl bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
          No member list available.
        </p>
      ) : (
        <ul className="grid gap-0.5 rounded-xl bg-muted/40 p-1">
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
                size="icon-sm"
                variant="ghost"
                className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  onRemoveMember?.(member.id);
                }}
                disabled={isRemoving}
                aria-label={`Remove ${member.displayName} from group`}
              >
                {isRemoving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserMinus className="size-4" />
                )}
              </Button>
            ) : null;

            const roleLabel = member.role
              ? participantRoleLabels[member.role]
              : participantRoleLabels[ParticipantRole.Member];

            return (
              <UserItem
                key={member.userId}
                action={removeAction}
                isActionLoading={sendingFriendRequestId === member.userId}
                user={{
                  id: member.userId,
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
                subtitle={roleLabel}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
