import { Button } from "@/components/ui/button";
import { ConversationTypeEnum } from "@/types/conversation";
import { cn } from "@/utils/cn";

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
      {conversationFilterTabs.map((tab) => (
        <Button
          key={tab.label}
          type="button"
          role="tab"
          size="sm"
          aria-selected={activeFilter === tab.value}
          variant="outline"
          className={cn(
            activeFilter === tab.value && "bg-primary/20! text-primary",
          )}
          onClick={() => {
            onFilterChange(tab.value);
          }}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
