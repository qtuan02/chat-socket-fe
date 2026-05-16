import { AlertCircle, Check, Clock3 } from "lucide-react";
import type { Message } from "@/types/message";
import { cn } from "@/utils/cn";
import { formatTime } from "@/utils/date";

type MessageBubbleProps = {
  isOwnMessage: boolean;
  message: Message;
  showSenderName: boolean;
};

function MessageStatusLabel({ message }: { message: Message }) {
  if (message.messageStatus === "sending") {
    return (
      <span className="inline-flex items-center gap-1">
        <Clock3 className="size-3" />
        Sending
      </span>
    );
  }

  if (message.messageStatus === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-destructive">
        <AlertCircle className="size-3" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Check className="size-3" />
      Sent
    </span>
  );
}

export function MessageBubble({
  isOwnMessage,
  message,
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
          "rounded-lg border px-2 py-1 text-sm shadow-sm max-w-[50vw]",
          isOwnMessage
            ? "border-primary/40 bg-primary text-primary-foreground"
            : "border-border bg-muted text-foreground",
        )}
      >
        {message.content}
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
    </div>
  );
}
