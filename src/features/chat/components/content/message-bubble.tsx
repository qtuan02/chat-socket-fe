import type { Message } from "@/types/message";
import { cn } from "@/utils/cn";
import { formatTime } from "@/utils/date";

type MessageBubbleProps = {
  isOwnMessage: boolean;
  message: Message;
  showSenderName: boolean;
};

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
          "rounded-lg border px-2 py-1 text-sm shadow-sm",
          isOwnMessage
            ? "border-primary/40 bg-primary text-primary-foreground"
            : "border-border bg-muted text-foreground",
        )}
      >
        {message.content}
        <p
          className={cn(
            "m-0 text-[10px]",
            isOwnMessage ? "text-right text-white" : "text-muted-foreground",
          )}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
