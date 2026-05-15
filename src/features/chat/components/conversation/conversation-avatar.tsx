import type { Conversation, ConversationMember } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import { cn } from "@/utils/cn";
import {
  getConversationAvatarMembers,
  getMemberInitials,
  getNameInitials,
  isConversationOnline,
} from "../../utils/conversation-display";

type ConversationAvatarProps = {
  className?: string;
  conversation: Conversation;
  showPresence?: boolean;
  size?: "sm" | "md";
};

type ConversationMemberAvatarProps = {
  className?: string;
  fallbackName: string;
  member?: ConversationMember;
  size: "sm" | "md";
};

const avatarSizeClassNames = {
  sm: {
    single: "size-10",
    stack: "h-10 w-12",
    stackItem: "size-8",
    text: "text-[10px]",
    presence: "size-3 border-2",
  },
  md: {
    single: "size-12",
    stack: "h-12 w-12",
    stackItem: "size-9",
    text: "text-xs",
    presence: "size-3.5 border-2",
  },
} as const;

function PresenceIndicator({
  isOnline,
  size,
}: {
  isOnline?: boolean;
  size: "sm" | "md";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute -bottom-0.5 -right-0.5 rounded-full border-background",
        avatarSizeClassNames[size].presence,
        isOnline === true && "bg-emerald-500",
        isOnline === false && "bg-muted-foreground/40",
        isOnline === undefined && "bg-muted-foreground/20",
      )}
    />
  );
}

function ConversationMemberAvatar({
  className,
  fallbackName,
  member,
  size,
}: ConversationMemberAvatarProps) {
  const label = member?.displayName ?? fallbackName;

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground shadow-sm",
        className,
      )}
    >
      {member?.avatarUrl ? (
        <img
          alt={label}
          className="size-full rounded-full object-cover"
          src={member.avatarUrl}
        />
      ) : (
        <span
          className={cn(
            "font-semibold leading-none",
            avatarSizeClassNames[size].text,
          )}
        >
          {member ? getMemberInitials(member) : getNameInitials(fallbackName)}
        </span>
      )}
    </div>
  );
}

export function ConversationAvatar({
  className,
  conversation,
  showPresence = true,
  size = "md",
}: ConversationAvatarProps) {
  const members = getConversationAvatarMembers(conversation);
  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const isOnline = isConversationOnline(conversation);

  if (isGroup && members.length > 1) {
    return (
      <div
        aria-label={`${conversation.title} avatar`}
        role="img"
        className={cn(
          "relative shrink-0",
          avatarSizeClassNames[size].stack,
          className,
        )}
      >
        <ConversationMemberAvatar
          className={cn(
            "absolute left-0 top-0",
            avatarSizeClassNames[size].stackItem,
          )}
          fallbackName={conversation.title}
          member={members[0]}
          size={size}
        />
        <ConversationMemberAvatar
          className={cn(
            "absolute bottom-0 right-0",
            avatarSizeClassNames[size].stackItem,
          )}
          fallbackName={conversation.title}
          member={members[1]}
          size={size}
        />
        {showPresence ? (
          <PresenceIndicator isOnline={isOnline} size={size} />
        ) : null}
      </div>
    );
  }

  return (
    <div
      aria-label={`${conversation.title} avatar`}
      role="img"
      className={cn("relative shrink-0", className)}
    >
      <ConversationMemberAvatar
        className={avatarSizeClassNames[size].single}
        fallbackName={conversation.title}
        member={members[0]}
        size={size}
      />
      {showPresence ? (
        <PresenceIndicator isOnline={isOnline} size={size} />
      ) : null}
    </div>
  );
}
