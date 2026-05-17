import * as React from "react";
import { AddGroupMembersDialog } from "@/features/group/components/add-group-members-dialog";
import { GroupConversationActions } from "@/features/group/components/group-conversation-actions";
import { GroupMembersSection } from "@/features/group/components/group-members-section";
import { RenameGroupDialog } from "@/features/group/components/rename-group-dialog";
import {
  type Conversation,
  ConversationTypeEnum,
  type GroupMembersRequest,
  ParticipantRole,
} from "@/types/conversation";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/date";
import {
  getConversationActivityAt,
  getDirectConversationMember,
} from "@/utils/display";
import { ConversationDetailsPanelHeader } from "./conversation-details-panel-header";
import { ConversationDirectMemberCard } from "./conversation-direct-member-card";

type ConversationDetailsPanelProps = {
  className?: string;
  conversation: Conversation;
  open: boolean;
  onClose?: () => void;
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

export function ConversationDetailsPanel({
  className,
  conversation,
  open,
  isRenameGroupSubmitting,
  isAddMembersSubmitting,
  isLeaveGroupSubmitting,
  removingMemberId,
  onSendFriendRequest,
  sendingFriendRequestId,
  onRenameGroup,
  onAddMembers,
  onLeaveGroup,
  onRemoveMember,
  onClose,
}: ConversationDetailsPanelProps) {
  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const members = conversation.members;
  const currentUserRole = members.find(
    (member) => member.userId === conversation.currentUserId,
  )?.role;
  const isCurrentUserAdmin = currentUserRole === ParticipantRole.Admin;
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = React.useState(false);
  const directMember = getDirectConversationMember(conversation);
  const lastActivityLabel = formatDateTime(
    getConversationActivityAt(conversation),
  );
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
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-[min(88vw,24rem)] min-w-0 flex-col overflow-y-auto border-l border-border bg-background pb-20 shadow-lg transition-[transform] duration-300 md:overflow-auto md:pb-0",
        "translate-x-full pointer-events-none md:static md:z-auto md:w-80 md:min-h-0 md:max-h-full md:translate-x-0 md:shadow-none",
        open ? "translate-x-0 pointer-events-auto" : "",
        open ? "md:flex" : "md:hidden",
        className,
      )}
      aria-hidden={!open}
      aria-label="Conversation details"
    >
      <div className="min-h-0 flex-1">
        <ConversationDetailsPanelHeader
          isGroup={isGroup}
          participantCount={conversation.participantCount}
          lastActivityLabel={lastActivityLabel}
          unreadMessages={conversation.unreadCount}
          onClose={onClose}
        />

        <div className="px-4 py-4">
          <section className="grid gap-3">
            {isGroup || !directMember ? null : (
              <ConversationDirectMemberCard member={directMember} />
            )}

            {isGroup ? (
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
            ) : null}

            {isGroup ? (
              <GroupMembersSection
                members={members}
                isCurrentUserAdmin={isCurrentUserAdmin}
                currentUserId={conversation.currentUserId}
                removingMemberId={removingMemberId}
                onSendFriendRequest={onSendFriendRequest}
                sendingFriendRequestId={sendingFriendRequestId}
                onRemoveMember={handleRemoveMember}
              />
            ) : null}
          </section>
        </div>
      </div>

      {isGroup ? (
        <>
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
      ) : null}
    </aside>
  );
}
