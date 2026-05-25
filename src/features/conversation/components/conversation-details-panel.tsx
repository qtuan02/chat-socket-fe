import type * as React from "react";
import { DetailField } from "@/components/shared/detail-field";
import { type Conversation, ConversationTypeEnum } from "@/types/conversation";
import { cn } from "@/utils/cn";
import { ConversationDetailsPanelHeader } from "./conversation-details-panel-header";

type ConversationDetailsPanelProps = {
  className?: string;
  conversation: Conversation;
  open: boolean;
  onClose?: () => void;
  groupSection?: React.ReactNode;
};

export function ConversationDetailsPanel({
  className,
  conversation,
  open,
  groupSection,
  onClose,
}: ConversationDetailsPanelProps) {
  const isGroup = conversation.type === ConversationTypeEnum.GROUP;
  const members = conversation.members;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-[min(88vw,24rem)] min-w-0 flex-col overflow-y-auto border-l border-border bg-background pb-20 shadow-lg transition-[transform] duration-300 md:overflow-auto md:pb-0",
        "translate-x-full pointer-events-none md:static md:z-auto md:w-80 md:min-h-0 md:max-h-full md:translate-x-0 md:shadow-none",
        open ? "translate-x-0 pointer-events-auto" : "",
        open ? "md:flex" : "md:hidden",
        className,
      )}
      aria-hidden={!open}
      aria-label="Conversation details"
    >
      <div className="min-h-0 flex-1">
        <ConversationDetailsPanelHeader isGroup={isGroup} onClose={onClose} />

        <div className="px-4 py-4">
          <section className="grid gap-3">
            <DetailField
              label="Type"
              value={
                conversation.type === ConversationTypeEnum.GROUP
                  ? "Group"
                  : "Direct message"
              }
            />
            <DetailField label="Group name" value={conversation.groupName} />
            <DetailField
              label="Unread messages"
              value={conversation.unreadCount}
            />
            <DetailField
              label="Participant count"
              value={conversation.participantCount}
            />
            <DetailField label="Members loaded" value={members.length} />
          </section>

          {isGroup ? groupSection : null}
        </div>
      </div>
    </aside>
  );
}
