import { BadgeCheck, Users } from "lucide-react";
import type { Conversation, ConversationMember } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/date";
import {
  getConversationActivityAt,
  getDirectConversationMember,
  getMemberInitials,
} from "../../utils/conversation-display";

type ConversationDetailsPanelProps = {
  className?: string;
  conversation: Conversation;
  open: boolean;
};

function getMemberPresenceLabel(member: ConversationMember) {
  if (member.isOnline === undefined) return "Checking";
  return member.isOnline ? "Online" : "Offline";
}

function MemberListItem({ member }: { member: ConversationMember }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-2">
      <div className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold">
        {member.avatarUrl ? (
          <img
            alt={member.displayName}
            className="size-9 rounded-full object-cover"
            src={member.avatarUrl}
          />
        ) : (
          <span>{getMemberInitials(member)}</span>
        )}
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background",
            member.isOnline === true && "bg-emerald-500",
            member.isOnline === false && "bg-muted-foreground/40",
            member.isOnline === undefined && "bg-muted-foreground/20",
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{member.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {member.role ?? "Member"}
        </p>
      </div>
      <div
        className={cn(
          "inline-flex h-6 min-w-16 items-center justify-center rounded-full px-2 py-0.5 text-xs",
          member.isOnline === true &&
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
          member.isOnline === false && "bg-muted text-muted-foreground",
          member.isOnline === undefined && "bg-muted/70 text-muted-foreground",
        )}
      >
        {getMemberPresenceLabel(member)}
      </div>
    </li>
  );
}

function formatUsername(member: ConversationMember) {
  if (!member.username) return "-";
  return member.username.startsWith("@")
    ? member.username
    : `@${member.username}`;
}

function DirectMemberAvatar({ member }: { member: ConversationMember }) {
  return (
    <div className="relative inline-flex size-40 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-xl font-semibold text-muted-foreground shadow-sm">
      {member.avatarUrl ? (
        <img
          alt={member.displayName}
          className="size-full rounded-full object-cover"
          src={member.avatarUrl}
        />
      ) : (
        <span>{getMemberInitials(member)}</span>
      )}
    </div>
  );
}

function DirectMemberCard({ member }: { member?: ConversationMember }) {
  if (!member) {
    return (
      <p className="text-sm text-muted-foreground">
        No user information available.
      </p>
    );
  }

  return (
    <>
      <div className="w-full flex justify-center">
        <DirectMemberAvatar member={member} />
      </div>
      <dl className="mt-4 grid gap-3">
        <div className="grid gap-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Full name
          </dt>
          <dd className="truncate text-sm font-medium">{member.displayName}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Username
          </dt>
          <dd className="truncate text-sm font-medium">
            {formatUsername(member)}
          </dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Status
          </dt>
          <dd className="truncate text-sm font-medium">
            {getMemberPresenceLabel(member)}
          </dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Joined
          </dt>
          <dd className="text-sm font-medium">
            {formatDateTime(member.joinedAt)}
          </dd>
        </div>
      </dl>
    </>
  );
}

export function ConversationDetailsPanel({
  className,
  conversation,
  open,
}: ConversationDetailsPanelProps) {
  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const members = conversation.members ?? [];
  const directMember = getDirectConversationMember(conversation);
  const activityAt = getConversationActivityAt(conversation);

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
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-2.5 h-16">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">
            Conversation Info
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {isGroup ? "Group details" : "Direct message details"}
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        <section className="grid gap-3">
          <dl className="grid gap-3">
            {!isGroup && <DirectMemberCard member={directMember} />}
            <div className="grid gap-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Type
              </dt>
              <dd className="font-medium">
                {isGroup ? "Group" : "Direct message"}
              </dd>
            </div>
            {isGroup && (
              <div className="grid gap-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Members
                </dt>
                <dd className="inline-flex items-center gap-2 font-medium">
                  <Users className="size-4" />
                  <span>{conversation.participantCount}</span>
                </dd>
              </div>
            )}
            <div className="grid gap-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Last activity
              </dt>
              <dd className="font-medium">{formatDateTime(activityAt)}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Unread messages
              </dt>
              <dd className="font-medium">{conversation.unreadCount}</dd>
            </div>
          </dl>
          <div className="grid gap-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {isGroup && "Group members"}
            </p>
            {isGroup &&
              (members.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No member list available.
                </p>
              ) : (
                <ul className="grid gap-2">
                  {members.map((member) => (
                    <MemberListItem key={member.id} member={member} />
                  ))}
                </ul>
              ))}
          </div>
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
    </aside>
  );
}
