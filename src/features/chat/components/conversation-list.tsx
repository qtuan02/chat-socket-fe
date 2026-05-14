import { MessageCircle, Search } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import type { Conversation, ConversationFilter } from "../types/chat";

const conversationFilterTabs: Array<{
  label: string;
  value: ConversationFilter;
}> = [
  { label: "All", value: "all" },
  { label: "Groups", value: "groups" },
  { label: "Direct", value: "direct" },
];

type ConversationListProps = {
  className?: string;
  activeConversationId: string;
  conversations: Conversation[];
  onConversationSelect: (id: string) => void;
  searchTerm: string;
  conversationFilter: ConversationFilter;
  onSearchTermChange: (value: string) => void;
  onConversationFilterChange: (value: ConversationFilter) => void;
};

function getConversationAvatar(conversation: Conversation) {
  if (conversation.avatarUrl) {
    return (
      <img
        alt={conversation.title}
        className="size-10 rounded-full object-cover"
        src={conversation.avatarUrl}
      />
    );
  }

  return (
    <div className="bg-muted text-muted-foreground inline-flex size-10 shrink-0 items-center justify-center rounded-full border">
      <span className="text-xs font-semibold">
        {conversation.title[0]?.toUpperCase()}
      </span>
    </div>
  );
}

export function ConversationList({
  className,
  activeConversationId,
  conversations,
  onConversationSelect,
  searchTerm,
  conversationFilter,
  onSearchTermChange,
  onConversationFilterChange,
}: ConversationListProps) {
  const searchInputId = React.useId();

  return (
    <aside className={cn("flex min-h-0 flex-col bg-background/60", className)}>
      <div className="h-16 flex items-center px-4 gap-2 border-b">
        <MessageCircle className="text-primary size-7" />
        <h1 className="text-2xl font-semibold">Conversations</h1>
      </div>
      <div className="px-4 pt-4">
        <label
          className="mb-4 block"
          htmlFor={`conversation-search-${searchInputId}`}
        >
          <span className="sr-only">Search conversations</span>
          <div className="text-muted-foreground relative">
            <Search className="pointer-events-none absolute left-3 top-2 size-4" />
            <Input
              id={`conversation-search-${searchInputId}`}
              value={searchTerm}
              onChange={(event) => {
                onSearchTermChange(event.target.value);
              }}
              placeholder="Search chats"
              type="search"
              className="h-9 pl-9 pr-3"
            />
          </div>
        </label>
        <div
          role="tablist"
          aria-label="Conversation filters"
          className="flex items-center gap-2"
        >
          {conversationFilterTabs.map((tab) => (
            <Button
              key={tab.value}
              type="button"
              role="tab"
              size="sm"
              aria-selected={conversationFilter === tab.value}
              variant={conversationFilter === tab.value ? "secondary" : "ghost"}
              onClick={() => {
                onConversationFilterChange(tab.value);
              }}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {conversations.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No conversations to show.
          </div>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;

              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition",
                      "hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isActive
                        ? "border-primary/70 bg-primary/10"
                        : "border-border/80 bg-background",
                    )}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => {
                      onConversationSelect(conversation.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {getConversationAvatar(conversation)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold">
                            {conversation.title}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            {conversation.lastMessageAt}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
