import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConversationDetailsPanelHeaderProps = {
  isGroup: boolean;
  onClose?: () => void;
};

export function ConversationDetailsPanelHeader({
  isGroup,
  onClose,
}: ConversationDetailsPanelHeaderProps) {
  return (
    <div className="flex h-16 items-start justify-between gap-2 border-b border-border px-4 py-2.5">
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold">Conversation Info</h2>
        <p className="truncate text-xs text-muted-foreground">
          {isGroup ? "Group conversation details" : "Direct message details"}
        </p>
      </div>

      {onClose ? (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onClose}
          className="md:hidden"
          aria-label="Close conversation info"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
