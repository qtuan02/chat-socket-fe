import { Users, X } from "lucide-react";
import { DetailField } from "@/components/shared/detail-field";
import { Button } from "@/components/ui/button";

type ConversationDetailsPanelHeaderProps = {
  isGroup: boolean;
  participantCount: number;
  lastActivityLabel: string;
  unreadMessages: number;
  onClose?: () => void;
};

export function ConversationDetailsPanelHeader({
  isGroup,
  participantCount,
  lastActivityLabel,
  unreadMessages,
  onClose,
}: ConversationDetailsPanelHeaderProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-2.5 h-16">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">
            Conversation Info
          </h2>
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

      <div className="px-4 py-4">
        <section className="grid gap-3">
          <DetailField
            label="Type"
            value={isGroup ? "Group" : "Direct message"}
          />

          {isGroup ? (
            <DetailField
              label="Members"
              value={
                <span className="inline-flex items-center gap-2">
                  <Users className="size-4" />
                  <span>{participantCount}</span>
                </span>
              }
            />
          ) : null}

          <DetailField label="Last activity" value={lastActivityLabel} />
          <DetailField
            label="Unread messages"
            value={<span>{unreadMessages}</span>}
          />
        </section>
      </div>
    </>
  );
}
