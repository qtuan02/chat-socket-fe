import { MessageCircle, Search, UsersRound } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router";
import { Virtuoso } from "react-virtuoso";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_ROUTES } from "@/config/routes";
import {
  useConversationsInfiniteQuery,
  useCreateGroupConversationMutation,
} from "@/hooks/api/conversation";
import {
  type Conversation,
  ConversationTypeEnum,
  type CreateGroupConversationRequest,
} from "@/types/conversation";
import type { Friend } from "@/types/friend";
import { cn } from "@/utils/cn";
import { formatTimestamp } from "@/utils/date";
import { getErrorMessage } from "@/utils/error";
import { ConversationAvatar } from "./conversation-avatar";
import { ConversationListSkeleton } from "./conversation-list-skeleton";
import { CreateGroupDialog } from "./create-group-dialog";
import { FriendSearchPanel } from "./friend-search-panel";

type ConversationListProps = {
  className?: string;
  activeConversationId: string;
  onConversationSelect?: () => void;
  onDirectMessageDraftSelect?: (friend: Friend) => void;
};

type ConversationFilterTab = {
  label: string;
  value: ConversationTypeEnum | null;
};

const conversationFilterTabs: ConversationFilterTab[] = [
  { label: "All", value: null },
  { label: "Groups", value: ConversationTypeEnum.GROUP },
  { label: "Direct", value: ConversationTypeEnum.DIRECT },
];

function getConversationTypeFilter(filter: ConversationTypeEnum | null) {
  return filter === ConversationTypeEnum.GROUP
    ? ConversationTypeEnum.GROUP
    : filter === ConversationTypeEnum.DIRECT
      ? ConversationTypeEnum.DIRECT
      : undefined;
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

function ConversationListItem({
  activeConversationId,
  conversation,
  onSelectConversation,
}: {
  activeConversationId: string;
  conversation: Conversation;
  onSelectConversation: (conversationId: string) => void;
}) {
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
          hasUnreadMessages && !isActive && "bg-primary/5",
        )}
        aria-current={isActive ? "true" : undefined}
        onClick={() => {
          onSelectConversation(conversation.id);
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
                  hasUnreadMessages && "font-medium text-foreground",
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
}

function ConversationListFilter({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: ConversationTypeEnum | null;
  onFilterChange: (nextFilter: ConversationTypeEnum | null) => void;
}) {
  return (
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
          aria-selected={activeFilter === tab.value}
          variant="outline"
          className={cn(
            activeFilter === tab.value && "bg-primary/20! text-primary",
          )}
          onClick={() => {
            onFilterChange(tab.value);
          }}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

function ConversationListError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
      <p className="m-0 mb-2 text-destructive">
        {getErrorMessage(error, "Unable to load conversations.")}
      </p>
      <Button type="button" size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export function ConversationList({
  className,
  activeConversationId,
  onConversationSelect,
  onDirectMessageDraftSelect,
}: ConversationListProps) {
  const navigate = useNavigate();
  const searchInputId = React.useId();
  const friendSearchRef = React.useRef<HTMLDivElement>(null);
  const [isFriendSearchOpen, setIsFriendSearchOpen] = React.useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);
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
  const createGroupMutation = useCreateGroupConversationMutation({
    onSuccess: (conversation) => {
      setIsCreateGroupOpen(false);
      toast.success("Group conversation created.");
      navigate(APP_ROUTES.conversationById(conversation.id));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create group."));
    },
  });

  const visibleConversations = React.useMemo(() => {
    return conversations;
  }, [conversations]);
  const conversationIdByFriendId = React.useMemo(() => {
    const directConversationMap = new Map<string, string>();

    for (const conversation of conversations) {
      const directMemberId = conversation.directMember?.userId;
      if (conversation.type === ConversationTypeEnum.DIRECT && directMemberId) {
        directConversationMap.set(directMemberId, conversation.id);
      }
    }

    return directConversationMap;
  }, [conversations]);

  const handleCloseFriendSearch = React.useCallback(() => {
    setIsFriendSearchOpen(false);
  }, []);

  React.useEffect(() => {
    if (!isFriendSearchOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (friendSearchRef.current?.contains(target)) return;

      handleCloseFriendSearch();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [handleCloseFriendSearch, isFriendSearchOpen]);

  const handleSelectConversation = React.useCallback(
    (conversationId: string) => {
      navigate(APP_ROUTES.conversationById(conversationId));
      onConversationSelect?.();
    },
    [navigate, onConversationSelect],
  );
  const handleSelectFriend = React.useCallback(
    (friend: Friend) => {
      const conversationId = conversationIdByFriendId.get(friend.id);
      if (!conversationId) {
        onDirectMessageDraftSelect?.(friend);
        handleCloseFriendSearch();
        return;
      }

      navigate(APP_ROUTES.conversationById(conversationId));
      onConversationSelect?.();
      handleCloseFriendSearch();
    },
    [
      conversationIdByFriendId,
      handleCloseFriendSearch,
      navigate,
      onConversationSelect,
      onDirectMessageDraftSelect,
    ],
  );

  const handleOpenCreateGroup = React.useCallback(() => {
    setIsCreateGroupOpen(true);
  }, []);

  const handleCreateGroup = React.useCallback(
    (payload: CreateGroupConversationRequest) => {
      createGroupMutation.mutate(payload);
    },
    [createGroupMutation],
  );

  return (
    <section
      className={cn("flex min-h-0 flex-col bg-background/60", className)}
    >
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <MessageCircle className="size-7 text-primary" />
        <h1 className="text-2xl font-semibold">Conversations</h1>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="ml-auto"
          onClick={handleOpenCreateGroup}
        >
          <UsersRound className="size-4" />
          <span className="sr-only">Create group conversation</span>
        </Button>
      </div>

      {isFriendSearchOpen ? (
        <div ref={friendSearchRef} className="min-h-0 flex-1 p-3 md:p-4">
          <FriendSearchPanel
            conversationIdByFriendId={conversationIdByFriendId}
            onBack={handleCloseFriendSearch}
            onSelectFriend={handleSelectFriend}
          />
        </div>
      ) : (
        <>
          <div className="md:px-4 md:pt-4 px-3 pt-3">
            <label
              className="mb-4 block"
              htmlFor={`conversation-search-${searchInputId}`}
            >
              <span className="sr-only">Search friends</span>
              <div className="relative text-muted-foreground">
                <Search className="pointer-events-none absolute left-3 top-2 size-4" />
                <Input
                  id={`conversation-search-${searchInputId}`}
                  readOnly
                  onFocus={() => {
                    setIsFriendSearchOpen(true);
                  }}
                  onClick={() => {
                    setIsFriendSearchOpen(true);
                  }}
                  placeholder="Search friends"
                  type="search"
                  className="h-9 cursor-text pl-9 pr-3"
                />
              </div>
            </label>

            <ConversationListFilter
              activeFilter={conversationFilter}
              onFilterChange={setConversationFilter}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-hidden p-3 md:p-4">
            {isLoading && <ConversationListSkeleton />}

            {isError && (
              <ConversationListError
                error={error}
                onRetry={() => {
                  void refetch();
                }}
              />
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
                itemContent={(_, conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    activeConversationId={activeConversationId}
                    conversation={conversation}
                    onSelectConversation={handleSelectConversation}
                  />
                )}
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
        </>
      )}

      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        isSubmitting={createGroupMutation.isPending}
        onOpenChange={setIsCreateGroupOpen}
        onCreate={handleCreateGroup}
      />
    </section>
  );
}
