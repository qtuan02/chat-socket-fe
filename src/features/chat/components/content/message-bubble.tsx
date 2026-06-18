import { AlertCircle, Check, Clock3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ConversationMember } from "@/types/conversation";
import {
  type Message,
  MessageStatus,
  messageStatusLabels,
} from "@/types/message";
import { cn } from "@/utils/cn";
import { formatTime } from "@/utils/date";
import { getDisplayNameInitials } from "@/utils/display";

export type MessageGroupPosition = "single" | "first" | "middle" | "last";

type MessageBubbleProps = {
  isOwnMessage: boolean;
  message: Message;
  position: MessageGroupPosition;
  readReceipts?: ConversationMember[];
  showSenderName: boolean;
};

const MAX_VISIBLE_READERS = 3;

const bubbleCornerClasses = {
  own: {
    single: "rounded-2xl",
    first: "rounded-2xl rounded-br-md",
    middle: "rounded-2xl rounded-r-md",
    last: "rounded-2xl rounded-tr-md",
  },
  other: {
    single: "rounded-2xl",
    first: "rounded-2xl rounded-bl-md",
    middle: "rounded-2xl rounded-l-md",
    last: "rounded-2xl rounded-tl-md",
  },
} as const;

function MessageStatusLabel({ message }: { message: Message }) {
  if (message.messageStatus === MessageStatus.Sending) {
    return (
      <span className="inline-flex items-center gap-1">
        <Clock3 className="size-3" />
        {messageStatusLabels[MessageStatus.Sending]}
      </span>
    );
  }

  if (message.messageStatus === MessageStatus.Failed) {
    return (
      <span className="inline-flex items-center gap-1 text-destructive">
        <AlertCircle className="size-3" />
        {messageStatusLabels[MessageStatus.Failed]}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Check className="size-3" />
      {messageStatusLabels[MessageStatus.Sent]}
    </span>
  );
}

function ReaderAvatar({
  member,
  className,
}: {
  member: ConversationMember;
  className?: string;
}) {
  return (
    <Avatar
      aria-label={member.displayName}
      className={cn(
        "size-4 border border-background bg-muted text-[8px] font-semibold leading-none text-muted-foreground",
        className,
      )}
      role="img"
      title={member.displayName}
    >
      {member.avatarUrl ? (
        <AvatarImage
          alt={member.displayName}
          className="object-cover"
          src={member.avatarUrl}
        />
      ) : null}
      <AvatarFallback className="text-[8px] font-semibold leading-none">
        {getDisplayNameInitials(member.displayName)}
      </AvatarFallback>
    </Avatar>
  );
}

function MessageReadReceipt({ readers }: { readers: ConversationMember[] }) {
  if (readers.length === 0) return null;

  const visibleReaders = readers.slice(0, MAX_VISIBLE_READERS);
  const readerNames = readers.map((reader) => reader.displayName).join(", ");

  return (
    <div
      className="-space-x-1 flex max-w-[50vw] items-center justify-end px-1 pt-0.5"
      title={readerNames}
    >
      {visibleReaders.map((reader) => (
        <ReaderAvatar key={reader.userId} member={reader} />
      ))}
    </div>
  );
}

export function MessageBubble({
  isOwnMessage,
  message,
  position,
  readReceipts = [],
  showSenderName,
}: MessageBubbleProps) {
  const cornerClass =
    bubbleCornerClasses[isOwnMessage ? "own" : "other"][position];

  return (
    <div
      className={cn(
        "flex max-w-full flex-col",
        isOwnMessage ? "items-end" : "items-start",
      )}
    >
      {!isOwnMessage && showSenderName ? (
        <p className="m-0 mb-0.5 px-3 text-xs text-muted-foreground">
          {message.senderName}
        </p>
      ) : null}
      <div
        className={cn(
          "min-w-0 px-3 py-2 text-sm [overflow-wrap:anywhere] md:max-w-[50vw] max-w-[75vw]",
          cornerClass,
          isOwnMessage
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        <p className="m-0 whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        <p
          className={cn(
            "m-0 mt-0.5 flex items-center gap-2 text-[10px]",
            isOwnMessage
              ? "justify-end text-primary-foreground/70"
              : "justify-start text-muted-foreground",
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isOwnMessage ? <MessageStatusLabel message={message} /> : null}
        </p>
      </div>
      {isOwnMessage ? <MessageReadReceipt readers={readReceipts} /> : null}
    </div>
  );
}
