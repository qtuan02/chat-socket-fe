import { CircleCheckBig, Info, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Conversation } from "../types/chat";

type ChatHeaderProps = {
  conversation: Conversation;
  onlineUsersCount?: number;
  onOpenDetails: () => void;
};

export function ChatHeader({
  conversation,
  onlineUsersCount,
  onOpenDetails,
}: ChatHeaderProps) {
  const isGroup = conversation.kind === "group";
  const onlineCount = onlineUsersCount ?? conversation.onlineUsersCount ?? 0;

  return (
    <header className="border-b border-border px-4 py-2.5 h-16">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold leading-tight">
            {conversation.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isGroup
              ? `${conversation.participantCount} members`
              : "Direct message"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            <span>{onlineCount} online</span>
          </div>
          {conversation.unreadCount > 0 ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
              <CircleCheckBig className="size-3.5" />
              <span>{conversation.unreadCount}</span>
            </div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={onOpenDetails}
          >
            <Info className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
