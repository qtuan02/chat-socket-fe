import { Users } from "lucide-react";
import { DetailField } from "@/components/shared/detail-field";

type ConversationDetailsPanelHeaderProps = {
  isGroup: boolean;
  participantCount: number;
  lastActivityLabel: string;
  unreadMessages: number;
};

export function ConversationDetailsPanelHeader({
  isGroup,
  participantCount,
  lastActivityLabel,
  unreadMessages,
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
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
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
