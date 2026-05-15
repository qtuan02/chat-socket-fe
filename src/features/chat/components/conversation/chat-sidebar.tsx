import { cn } from "@/utils/cn";
import { ChatCurrentUserSection } from "./chat-current-user-section";
import { ConversationList } from "./conversation-list";

type ChatSidebarProps = {
  className?: string;
  activeConversationId: string;
  onConversationSelect?: () => void;
};

export function ChatSidebar({
  className,
  activeConversationId,
  onConversationSelect,
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
        className="min-h-0 flex-1 overflow-hidden"
        onConversationSelect={onConversationSelect}
      />
      <ChatCurrentUserSection />
    </aside>
  );
}
