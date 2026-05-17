import { Search } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";

type FriendSearchTriggerProps = {
  onOpen: () => void;
};

export function FriendSearchTrigger({ onOpen }: FriendSearchTriggerProps) {
  const searchInputId = React.useId();

  return (
    <label
      className="mb-4 block"
      htmlFor={`conversation-search-${searchInputId}`}
    >
      <span className="sr-only">Search friends</span>
      <div className="relative text-muted-foreground">
        <Search className="pointer-events-none absolute left-3 top-2 size-4" />
        <Input
          id={`conversation-search-${searchInputId}`}
          readOnly
          onFocus={onOpen}
          onClick={onOpen}
          placeholder="Search friends"
          type="search"
          className="h-9 cursor-text pl-9 pr-3"
        />
      </div>
    </label>
  );
}
