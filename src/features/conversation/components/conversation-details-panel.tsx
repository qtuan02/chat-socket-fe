import { BadgeCheck, LogOut, PencilLine, UserPlus } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
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
} from "../utils/conversation-display";
import { AddGroupMembersDialog } from "./add-group-members-dialog";
import { ConversationDetailsPanelHeader } from "./conversation-details-panel-header";
import { ConversationDirectMemberCard } from "./conversation-direct-member-card";
import { ConversationMembersSection } from "./conversation-members-section";
import { RenameGroupDialog } from "./rename-group-dialog";

type ConversationDetailsPanelProps = {
  className?: string;
  conversation: Conversation;
  open: boolean;
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
        "fixed inset-y-0 right-0 z-40 flex w-[min(88vw,24rem)] min-w-0 flex-col border-l border-border bg-background shadow-lg transition-[transform] duration-300",
        "translate-x-full pointer-events-none md:static md:z-auto md:w-80 md:min-h-0 md:max-h-full md:translate-x-0 md:shadow-none",
        open ? "translate-x-0 pointer-events-auto" : "",
        open ? "md:flex" : "md:hidden",
        className,
      )}
      aria-hidden={!open}
      aria-label="Conversation details"
    >
      <ConversationDetailsPanelHeader
        isGroup={isGroup}
        participantCount={conversation.participantCount}
        lastActivityLabel={lastActivityLabel}
        unreadMessages={conversation.unreadCount}
      />

      <div className="px-4 py-4">
        <section className="grid gap-3">
          {isGroup || !directMember ? null : (
            <ConversationDirectMemberCard member={directMember} />
          )}

          {isGroup ? (
            <section className="grid gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Group actions
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsRenameOpen(true);
                  }}
                >
                  <PencilLine className="size-4" />
                  Rename group
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddMembersOpen(true);
                  }}
                >
                  <UserPlus className="size-4" />
                  Add members
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLeaveGroup}
                  disabled={isLeaveGroupSubmitting}
                  className="sm:col-span-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive sm:justify-center"
                >
                  <LogOut className="size-4" />
                  {isLeaveGroupSubmitting ? "Leaving..." : "Leave group"}
                </Button>
              </div>
            </section>
          ) : null}

          <ConversationMembersSection
            isGroup={isGroup}
            members={members}
            isCurrentUserAdmin={isCurrentUserAdmin}
            currentUserId={conversation.currentUserId}
            removingMemberId={removingMemberId}
            onSendFriendRequest={onSendFriendRequest}
            sendingFriendRequestId={sendingFriendRequestId}
            onRemoveMember={handleRemoveMember}
          />
        </section>
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2">
          <p className="text-xs text-muted-foreground">Conversation health</p>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
            <BadgeCheck className="size-4 text-emerald-500" />
            {isGroup
              ? "Active and ready for new messages"
              : "Direct channel is available"}
          </p>
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
