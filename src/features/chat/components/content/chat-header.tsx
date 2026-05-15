import { CircleCheckBig, Columns2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";
import {
  formatDirectConversationStatus,
  formatGroupActiveCount,
} from "../../utils/conversation-display";
import { ConversationAvatar } from "../conversation/conversation-avatar";

type ChatHeaderProps = {
  conversation: Conversation;
  onOpenDetails: () => void;
};

export function ChatHeader({ conversation, onOpenDetails }: ChatHeaderProps) {
  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const statusLabel = isGroup
    ? formatGroupActiveCount(conversation)
    : formatDirectConversationStatus(conversation);

  return (
    <header className="h-16 border-b border-border px-4 py-2.5">
      <div className="flex h-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ConversationAvatar conversation={conversation} size="md" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-tight">
              {conversation.title}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {statusLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            aria-label="Toggle conversation info"
          >
            <Columns2Icon className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
