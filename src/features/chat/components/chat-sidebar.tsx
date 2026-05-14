import { cn } from "@/utils/cn";
import type { Conversation, ConversationFilter } from "../types/chat";
import { ChatCurrentUserSection } from "./chat-current-user-section";
import { ConversationList } from "./conversation-list";

type ChatSidebarProps = {
  className?: string;
  conversations: Conversation[];
  activeConversationId: string;
  conversationFilter: ConversationFilter;
  searchTerm: string;
  onConversationFilterChange: (value: ConversationFilter) => void;
  onConversationSelect: (id: string) => void;
  onSearchTermChange: (value: string) => void;
  isSignOutPending: boolean;
  onSignOut: () => void;
};

export function ChatSidebar({
  className,
  conversations,
  activeConversationId,
  conversationFilter,
  searchTerm,
  onConversationFilterChange,
  onConversationSelect,
  onSearchTermChange,
  isSignOutPending,
  onSignOut,
}: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "flex min-h-0 w-full flex-col border-border bg-background",
        className,
      )}
    >
      <ConversationList
        activeConversationId={activeConversationId}
        conversationFilter={conversationFilter}
        conversations={conversations}
        onConversationFilterChange={onConversationFilterChange}
        onConversationSelect={onConversationSelect}
        onSearchTermChange={onSearchTermChange}
        searchTerm={searchTerm}
        className="min-h-0 flex-1 overflow-hidden"
      />
      <ChatCurrentUserSection
        isSignOutPending={isSignOutPending}
        onSignOut={onSignOut}
      />
    </aside>
  );
}
