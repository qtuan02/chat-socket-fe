import { AlertCircle, Check, Clock3 } from "lucide-react";
import type { ConversationMember } from "@/types/conversation";
import {
  type Message,
  MessageStatus,
  messageStatusLabels,
} from "@/types/message";
import { cn } from "@/utils/cn";
import { formatTime } from "@/utils/date";
import { getDisplayNameInitials } from "@/utils/user-display";

type MessageBubbleProps = {
  isOwnMessage: boolean;
  message: Message;
  readReceipts?: ConversationMember[];
  showSenderName: boolean;
};

const MAX_VISIBLE_READERS = 3;

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
    <span
      aria-label={member.displayName}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full border border-background bg-muted text-[8px] font-semibold leading-none text-muted-foreground",
        className,
      )}
      role="img"
      title={member.displayName}
    >
      {member.avatarUrl ? (
        <img
          alt={member.displayName}
          className="size-full rounded-full object-cover"
          src={member.avatarUrl}
        />
      ) : (
        getDisplayNameInitials(member.displayName)
      )}
    </span>
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
  readReceipts = [],
  showSenderName,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex max-w-full flex-col",
        isOwnMessage ? "items-end" : "items-start",
      )}
    >
      {!isOwnMessage && showSenderName ? (
        <p className="m-0 px-1 text-xs text-muted-foreground">
          {message.senderName}
        </p>
      ) : null}
      <div
        className={cn(
          "min-w-0 rounded-lg border px-2 py-1 text-sm shadow-sm [overflow-wrap:anywhere] md:max-w-[50vw] max-w-[70vw]",
          isOwnMessage
            ? "border-primary/40 bg-primary text-primary-foreground"
            : "border-border bg-muted text-foreground",
        )}
      >
        <p className="m-0 whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        <p
          className={cn(
            "m-0 flex items-center gap-2 text-[10px]",
            isOwnMessage
              ? "justify-end text-white/85"
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
