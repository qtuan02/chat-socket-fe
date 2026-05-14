import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Conversation } from "../types/chat";

type ConversationListProps = {
  className?: string;
  activeConversationId: string;
  conversations: Conversation[];
};

export function ConversationList({
  className,
  activeConversationId,
  conversations,
}: ConversationListProps) {
  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col border-r border-border bg-background/60 p-4 md:min-h-0 md:w-[320px] md:border-r",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Conversations</h2>
        <span className="text-xs font-medium text-muted-foreground">
          {conversations.length} chats
        </span>
      </div>
      <label className="mb-3 block">
        <span className="sr-only">Search conversations</span>
        <div className="text-muted-foreground relative flex items-center">
          <Search className="absolute left-2 size-4" />
          <input
            type="search"
            placeholder="Search"
            className="w-full rounded-md border border-border bg-background px-8 py-2 text-sm outline-none ring-0 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            disabled
          />
        </div>
      </label>

      {conversations.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No conversations yet. Open the chat list from API later.
        </div>
      ) : (
        <ul className="space-y-2 overflow-y-auto">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;

            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-md border p-3 text-left transition",
                    "hover:border-primary/50 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    isActive
                      ? "border-primary/70 bg-primary/10"
                      : "border-border/80 bg-background",
                  )}
                  aria-current={isActive ? "true" : undefined}
                  disabled
                >
                  <p className="text-sm font-semibold">{conversation.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {conversation.lastMessage}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{conversation.lastMessageAt}</span>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
