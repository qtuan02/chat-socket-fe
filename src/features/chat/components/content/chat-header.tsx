import { ArrowLeft, CircleCheckBig, Columns2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationAvatar } from "@/features/conversation/components/conversation-avatar";
import {
  formatDirectConversationStatus,
  formatGroupActiveCount,
} from "@/features/conversation/utils/conversation-display";
import type { Conversation } from "@/types/conversation";
import { ConversationTypeEnum } from "@/types/conversation";

type ChatHeaderProps = {
  conversation: Conversation;
  onOpenDetails?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
};

export function ChatHeader({
  conversation,
  onOpenDetails,
  showBackButton,
  onBack,
}: ChatHeaderProps) {
  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const statusLabel = isGroup
    ? formatGroupActiveCount(conversation)
    : formatDirectConversationStatus(conversation);

  return (
    <header className="h-14 border-b border-border bg-background px-3 py-2 md:h-16 md:px-4 md:py-2">
      <div className="flex h-full items-center gap-2 md:gap-3 justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && onBack ? (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={onBack}
              className="md:hidden"
              aria-label="Go back to conversations"
            >
              <ArrowLeft className="size-4" />
            </Button>
          ) : null}
          <div className="flex min-w-0 items-center gap-3">
            <ConversationAvatar conversation={conversation} size="md" />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold leading-tight md:text-lg">
                {conversation.title}
              </h1>
              <p className="truncate text-[11px] text-muted-foreground md:text-sm">
                {statusLabel}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversation.unreadCount > 0 ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
              <CircleCheckBig className="size-3.5" />
              <span>{conversation.unreadCount}</span>
            </div>
          ) : null}
          {onOpenDetails ? (
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={onOpenDetails}
              aria-label="Toggle conversation info"
            >
              <Columns2Icon className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
