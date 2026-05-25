import * as React from "react";
import { AddGroupMembersDialog } from "@/features/group/components/add-group-members-dialog";
import { GroupConversationActions } from "@/features/group/components/group-conversation-actions";
import { GroupMembersSection } from "@/features/group/components/group-members-section";
import { RenameGroupDialog } from "@/features/group/components/rename-group-dialog";
import {
  type Conversation,
  type GroupMembersRequest,
  ParticipantRole,
} from "@/types/conversation";

type GroupDetailsSectionProps = {
  conversation: Conversation;
  isRenameGroupSubmitting?: boolean;
  isAddMembersSubmitting?: boolean;
  isLeaveGroupSubmitting?: boolean;
  removingMemberId?: string | null;
  sendingFriendRequestId?: string | null;
  onSendFriendRequest?: (userId: string, message?: string) => void;
  onRenameGroup?: (name: string) => void;
  onAddMembers?: (payload: GroupMembersRequest) => void;
  onLeaveGroup?: () => void;
  onRemoveMember?: (memberId: string) => void;
};

export function GroupDetailsSection({
  conversation,
  isRenameGroupSubmitting,
  isAddMembersSubmitting,
  isLeaveGroupSubmitting,
  removingMemberId,
  sendingFriendRequestId,
  onSendFriendRequest,
  onRenameGroup,
  onAddMembers,
  onLeaveGroup,
  onRemoveMember,
}: GroupDetailsSectionProps) {
  const members = conversation.members;
  const currentUserRole = members.find(
    (member) => member.userId === conversation.currentUserId,
  )?.role;
  const isCurrentUserAdmin = currentUserRole === ParticipantRole.Admin;
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = React.useState(false);
  const disabledFriendIds = React.useMemo(
    () => members.map((member) => member.userId),
    [members],
  );

  const handleRenameGroup = React.useCallback(
    (name: string) => {
      onRenameGroup?.(name);
      setIsRenameOpen(false);
    },
    [onRenameGroup],
  );

  const handleAddMembers = React.useCallback(
    (payload: GroupMembersRequest) => {
      onAddMembers?.(payload);
      setIsAddMembersOpen(false);
    },
    [onAddMembers],
  );

  const handleLeaveGroup = React.useCallback(() => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    onLeaveGroup?.();
  }, [onLeaveGroup]);

  const handleRemoveMember = React.useCallback(
    (memberId: string) => {
      if (
        !window.confirm(
          "Are you sure you want to remove this member from the group?",
        )
      )
        return;

      onRemoveMember?.(memberId);
    },
    [onRemoveMember],
  );

  return (
    <>
      <section className="mt-4 grid gap-3">
        <GroupConversationActions
          isLeaveGroupSubmitting={Boolean(isLeaveGroupSubmitting)}
          onAddMembersClick={() => {
            setIsAddMembersOpen(true);
          }}
          onLeaveGroupClick={handleLeaveGroup}
          onRenameGroupClick={() => {
            setIsRenameOpen(true);
          }}
        />

        <GroupMembersSection
          members={members}
          isCurrentUserAdmin={isCurrentUserAdmin}
          currentUserId={conversation.currentUserId}
          removingMemberId={removingMemberId}
          onSendFriendRequest={onSendFriendRequest}
          sendingFriendRequestId={sendingFriendRequestId}
          onRemoveMember={handleRemoveMember}
        />
      </section>

      <RenameGroupDialog
        isOpen={isRenameOpen}
        isSubmitting={Boolean(isRenameGroupSubmitting)}
        name={conversation.title}
        onOpenChange={setIsRenameOpen}
        onRename={handleRenameGroup}
      />

      <AddGroupMembersDialog
        isOpen={isAddMembersOpen}
        isSubmitting={Boolean(isAddMembersSubmitting)}
        disabledFriendIds={disabledFriendIds}
        onOpenChange={setIsAddMembersOpen}
        onAddMembers={handleAddMembers}
      />
    </>
  );
}
