import { AtSign, CalendarDays, Info } from "lucide-react";
import type * as React from "react";
import { ConversationAvatar } from "@/components/shared/conversation-avatar";
import {
  type Conversation,
  type ConversationMember,
  ConversationTypeEnum,
} from "@/types/conversation";
import { PresenceStatusEnum } from "@/types/user";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/date";
import {
  getMemberPresenceLabel,
  getUsernameLabel,
  isConversationOnline,
} from "@/utils/display";
import { ConversationDetailsPanelHeader } from "./conversation-details-panel-header";

type ConversationDetailsPanelProps = {
  className?: string;
  conversation: Conversation;
  open: boolean;
  onClose?: () => void;
  groupSection?: React.ReactNode;
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-3 py-2.5">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function DirectMemberInfo({ member }: { member: ConversationMember }) {
  const usernameLabel = getUsernameLabel(member.username);
  const isOnline = member.presenceStatus === PresenceStatusEnum.Online;

  return (
    <section className="overflow-hidden rounded-xl bg-muted/40 [&>*+*]:border-t [&>*+*]:border-border/50">
      <InfoRow
        icon={
          <span
            className={cn(
              "mt-1 block size-2.5 rounded-full",
              isOnline ? "bg-online" : "bg-muted-foreground/40",
            )}
          />
        }
        label="Status"
        value={getMemberPresenceLabel(member)}
      />
      {usernameLabel ? (
        <InfoRow
          icon={<AtSign className="size-4" />}
          label="Username"
          value={usernameLabel}
        />
      ) : null}
      {member.bio ? (
        <InfoRow
          icon={<Info className="size-4" />}
          label="Bio"
          value={member.bio}
        />
      ) : null}
      {member.joinedAt ? (
        <InfoRow
          icon={<CalendarDays className="size-4" />}
          label="Joined"
          value={formatDateTime(member.joinedAt)}
        />
      ) : null}
    </section>
  );
}

export function ConversationDetailsPanel({
  className,
  conversation,
  open,
  groupSection,
  onClose,
}: ConversationDetailsPanelProps) {
  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const directMember =
    conversation.directMember ??
    conversation.members.find(
      (member) => member.userId !== conversation.currentUserId,
    );
  const subtitle = isGroup
    ? `${conversation.participantCount} members`
    : isConversationOnline(conversation)
      ? "Active now"
      : "Direct message";

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
        <ConversationDetailsPanelHeader isGroup={isGroup} onClose={onClose} />

        <div className="flex flex-col items-center gap-3 px-4 pb-2 pt-6 text-center">
          <ConversationAvatar
            conversation={conversation}
            showPresence
            size="md"
          />
          <div className="w-full min-w-0">
            <h3 className="line-clamp-2 text-balance break-words text-lg font-semibold leading-tight">
              {conversation.title}
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2">
          {isGroup ? (
            groupSection
          ) : directMember ? (
            <DirectMemberInfo member={directMember} />
          ) : null}
        </div>
      </div>
    </aside>
  );
}
