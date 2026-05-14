import { MessageSquare } from "lucide-react";
import * as React from "react";
import type { ChatMessage } from "../types/chat";
import { MessageBubble } from "./message-bubble";

type MessageListProps = {
  className?: string;
  currentUserId: string;
  messages: ChatMessage[];
};

export function MessageList({
  className,
  currentUserId,
  messages,
}: MessageListProps) {
  const messageListRef = React.useRef<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <section
        className={
          className ??
          "flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground"
        }
      >
        <MessageSquare className="size-8" />
        <p>No messages yet.</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Composer is currently visual-only until behavior is implemented.
        </p>
      </section>
    );
  }

  return (
    <section
      ref={messageListRef}
      className={`min-h-0 flex-1 overflow-y-auto scroll-smooth px-4 py-5 md:px-6 ${className ?? ""}`}
    >
      <div className="flex min-h-full flex-col gap-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === currentUserId}
          />
        ))}
      </div>
    </section>
  );
}
