import { BadgeCheck, CircleDashed, CircleX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { Conversation, ConversationMember } from "../types/chat";

type ConversationDetailsPanelProps = {
  className?: string;
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getMemberInitials(member: ConversationMember) {
  const normalized = member.displayName.trim();
  if (!normalized) {
    return "--";
  }

  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
  }

  return normalized[0]?.toUpperCase() ?? "--";
}

function MemberListItem({ member }: { member: ConversationMember }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-2">
      <div className="bg-background inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold">
        {member.avatarUrl ? (
          <img
            alt={member.displayName}
            className="size-9 rounded-full object-cover"
            src={member.avatarUrl}
          />
        ) : (
          <span>{getMemberInitials(member)}</span>
        )}
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
          member.isOnline
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
            : "bg-muted text-muted-foreground",
        )}
      >
        {member.isOnline ? "Online" : "Offline"}
      </div>
    </li>
  );
}

export function ConversationDetailsPanel({
  className,
  conversation,
  onOpenChange,
  open,
}: ConversationDetailsPanelProps) {
  const isGroup = conversation.kind === "group";
  const members = conversation.members ?? [];

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
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => {
            onOpenChange(false);
          }}
          className="shrink-0"
          aria-label="Close details"
        >
          <CircleX className="size-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        <section className="grid gap-3">
          <dl className="grid gap-3">
            <div className="grid gap-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Type
              </dt>
              <dd className="font-medium">
                {isGroup ? "Group" : "Direct message"}
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {isGroup ? "Members" : "People"}
              </dt>
              <dd className="inline-flex items-center gap-2 font-medium">
                <Users className="size-4" />
                <span>{conversation.participantCount}</span>
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Last activity
              </dt>
              <dd className="font-medium">{conversation.lastMessageAt}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Unread messages
              </dt>
              <dd className="font-medium">{conversation.unreadCount}</dd>
            </div>
            {conversation.statusText ? (
              <div className="grid gap-1">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </dt>
                <dd className="inline-flex items-center gap-2 text-sm font-medium">
                  <CircleDashed className="size-4 text-muted-foreground" />
                  {conversation.statusText}
                </dd>
              </div>
            ) : null}
          </dl>
          <div className="grid gap-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {isGroup ? "Group members" : "Participants"}
            </p>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No member list available.
              </p>
            ) : (
              <ul className="grid gap-2">
                {members.map((member) => (
                  <MemberListItem key={member.id} member={member} />
                ))}
              </ul>
            )}
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
