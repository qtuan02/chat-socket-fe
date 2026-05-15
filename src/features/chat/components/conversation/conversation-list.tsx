import { MessageCircle, Search } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router";
import { Virtuoso } from "react-virtuoso";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_ROUTES } from "@/config/routes";
import { type Conversation, ConversationTypeEnum } from "@/types/conversation";
import { cn } from "@/utils/cn";
import { formatTimestamp } from "@/utils/date";
import {
  getConversationTypeFilter,
  useChatConversations,
} from "../../hooks/use-chat-conversations";
import { ConversationListSkeleton } from "../skeleton/conversation-list-skeleton";

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

function ConversationAvatar({ conversation }: { conversation: Conversation }) {
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
    <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
      <span className="text-xs font-semibold">
        {conversation.title[0]?.toUpperCase()}
      </span>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Unable to load conversations.";
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
  } = useChatConversations(getConversationTypeFilter(conversationFilter));

  const visibleConversations = React.useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) return conversations;

    return conversations.filter((conversation) =>
      `${conversation.title} ${conversation.lastMessage}`
        .toLowerCase()
        .includes(normalizedSearchTerm),
    );
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

              return (
                <div className="px-1 pt-2">
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition",
                      "hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isActive
                        ? "border-primary/70 bg-primary/10"
                        : "border-border/80 bg-background",
                    )}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => {
                      handleSelectConversation(conversation.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <ConversationAvatar conversation={conversation} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="m-0 truncate text-sm font-semibold">
                            {conversation.title}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            {formatTimestamp(conversation.lastMessageAt)}
                          </span>
                        </div>
                        <p className="m-0 mt-1 truncate text-xs text-muted-foreground">
                          {conversation.lastMessage}
                        </p>
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
