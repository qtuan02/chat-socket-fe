import { Button } from "@/components/ui/button";
import { ConversationTypeEnum } from "@/types/conversation";

type ConversationFilterTab = {
  label: string;
  value: ConversationTypeEnum | null;
};

type ConversationListFilterProps = {
  activeFilter: ConversationTypeEnum | null;
  onFilterChange: (nextFilter: ConversationTypeEnum | null) => void;
};

const conversationFilterTabs: ConversationFilterTab[] = [
  { label: "All", value: null },
  { label: "Groups", value: ConversationTypeEnum.GROUP },
  { label: "Direct", value: ConversationTypeEnum.DIRECT },
];

export function ConversationListFilter({
  activeFilter,
  onFilterChange,
}: ConversationListFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Conversation filters"
      className="flex items-center gap-2"
    >
      {conversationFilterTabs.map((tab) => {
        const isActive = activeFilter === tab.value;

        return (
          <Button
            key={tab.label}
            type="button"
            role="tab"
            size="sm"
            variant={isActive ? "default" : "secondary"}
            aria-selected={isActive}
            className="rounded-full"
            onClick={() => {
              onFilterChange(tab.value);
            }}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
