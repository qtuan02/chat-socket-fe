import { cn } from "@/utils/cn";
import type { ChatMessage } from "../types/chat";

type MessageBubbleProps = {
  isOwnMessage: boolean;
  message: ChatMessage;
};

export function MessageBubble({ isOwnMessage, message }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-1",
        isOwnMessage ? "items-end self-end" : "items-start",
      )}
    >
      {!isOwnMessage ? (
        <p className="px-1 text-xs text-muted-foreground">
          {message.senderName}
        </p>
      ) : null}
      <div
        className={cn(
          "rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isOwnMessage
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {message.content}
      </div>
      <p
        className={cn(
          "text-xs text-muted-foreground",
          isOwnMessage ? "text-right" : "",
        )}
      >
        {message.sentAt}
      </p>
    </div>
  );
}
