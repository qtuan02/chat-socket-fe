import { MessageCircle, Search } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router";
import { Virtuoso } from "react-virtuoso";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_ROUTES } from "@/config/routes";
import { useConversationsInfiniteQuery } from "@/hooks/api/conversation";
import { type Conversation, ConversationTypeEnum } from "@/types/conversation";
import { cn } from "@/utils/cn";
import { formatTimestamp } from "@/utils/date";
import { ConversationListSkeleton } from "../skeleton/conversation-list-skeleton";
import { ConversationAvatar } from "./conversation-avatar";

type ConversationListProps = {
  className?: string;
  activeConversationId: string;
  onConversationSelect?: () => void;
};

const conversationFilterTabs: Array<{
  label: string;
  value: ConversationTypeEnum | null;
}> = [
  { label: "All", value: null },
  { label: "Groups", value: ConversationTypeEnum.GROUP },
  { label: "Direct", value: ConversationTypeEnum.DIRECT },
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Unable to load conversations.";
}

function getConversationTypeFilter(filter: ConversationTypeEnum | null) {
  if (filter === ConversationTypeEnum.GROUP) return ConversationTypeEnum.GROUP;
  if (filter === ConversationTypeEnum.DIRECT)
    return ConversationTypeEnum.DIRECT;

  return undefined;
}

function formatLastMessagePreview(conversation: Conversation) {
  if (!conversation.lastMessageId) return conversation.lastMessage;

  const senderLabel =
    conversation.lastMessageSenderId === conversation.currentUserId
      ? "You"
      : conversation.lastMessageSenderName || "Unknown";

  return `${senderLabel}: ${conversation.lastMessage}`;
}

function formatUnreadCount(unreadCount: number) {
  if (unreadCount > 99) return "99+";
  return unreadCount.toString();
}

export function ConversationList({
  className,
  activeConversationId,
  onConversationSelect,
}: ConversationListProps) {
  const navigate = useNavigate();
  const searchInputId = React.useId();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [conversationFilter, setConversationFilter] =
    React.useState<ConversationTypeEnum | null>(null);

  const {
    conversations,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useConversationsInfiniteQuery({
    type: getConversationTypeFilter(conversationFilter),
  });

  const visibleConversations = React.useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) return conversations;

    return conversations.filter((conversation) => {
      const preview = formatLastMessagePreview(conversation);

      return `${conversation.title} ${preview}`
        .toLowerCase()
        .includes(normalizedSearchTerm);
    });
  }, [conversations, searchTerm]);

  const handleSelectConversation = (conversationId: string) => {
    navigate(APP_ROUTES.conversationById(conversationId));
    onConversationSelect?.();
  };

  return (
    <section
      className={cn("flex min-h-0 flex-col bg-background/60", className)}
    >
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <MessageCircle className="size-7 text-primary" />
        <h1 className="text-2xl font-semibold">Conversations</h1>
      </div>

      <div className="px-4 pt-4">
        <label
          className="mb-4 block"
          htmlFor={`conversation-search-${searchInputId}`}
        >
          <span className="sr-only">Search conversations</span>
          <div className="relative text-muted-foreground">
            <Search className="pointer-events-none absolute left-3 top-2 size-4" />
            <Input
              id={`conversation-search-${searchInputId}`}
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
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
              variant="outline"
              className={cn(
                conversationFilter === tab.value &&
                  "bg-primary/20! text-primary",
              )}
              onClick={() => {
                setConversationFilter(tab.value);
              }}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 py-4">
        {isLoading && <ConversationListSkeleton />}

        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
            <p className="m-0 mb-2 text-destructive">
              {getErrorMessage(error)}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                void refetch();
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {visibleConversations.length === 0 && !isLoading && !isError && (
          <p className="m-0 text-sm text-muted-foreground">
            No conversations to show.
          </p>
        )}

        {visibleConversations.length > 0 && !isLoading && !isError && (
          <Virtuoso
            data={visibleConversations}
            endReached={() => {
              if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
            }}
            itemContent={(_, conversation) => {
              const isActive = conversation.id === activeConversationId;
              const lastMessagePreview = formatLastMessagePreview(conversation);
              const hasUnreadMessages = conversation.unreadCount > 0;

              return (
                <div className="px-1 pt-2">
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-lg border p-2 text-left transition",
                      "hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isActive
                        ? "border-primary/70! bg-primary/10!"
                        : "border-border/80 bg-background",
                      hasUnreadMessages &&
                        !isActive &&
                        "border-primary/50 bg-primary/5",
                    )}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => {
                      handleSelectConversation(conversation.id);
                    }}
                  >
                    <div className="flex items-start gap-3 min-h-12">
                      <ConversationAvatar conversation={conversation} />
                      <div className="min-w-0 flex-1 py-1">
                        <div className="flex items-center justify-between gap-3">
                          <p
                            className={cn(
                              "m-0 truncate text-sm font-medium",
                              hasUnreadMessages && "font-semibold",
                            )}
                          >
                            {conversation.title}
                          </p>
                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={cn(
                                "text-[11px] text-muted-foreground",
                                hasUnreadMessages && "font-medium text-primary",
                              )}
                            >
                              {formatTimestamp(conversation.lastMessageAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <p
                            className={cn(
                              "m-0 mt-1 truncate text-xs text-muted-foreground",
                              hasUnreadMessages &&
                                "font-medium text-foreground",
                            )}
                          >
                            {lastMessagePreview}
                          </p>
                          {hasUnreadMessages ? (
                            <span className="inline-flex size-4 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                              {formatUnreadCount(conversation.unreadCount)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            }}
            components={{
              Footer: () =>
                isFetchingNextPage ? (
                  <div className="px-1 pb-2 pt-3">
                    <Skeleton className="mx-auto h-3 w-32 rounded-full" />
                  </div>
                ) : null,
            }}
          />
        )}
      </div>
    </section>
  );
}
