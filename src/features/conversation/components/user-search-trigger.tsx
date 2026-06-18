import { Search } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";

type UserSearchTriggerProps = {
  onOpen: () => void;
};

export function UserSearchTrigger({ onOpen }: UserSearchTriggerProps) {
  const searchInputId = React.useId();

  return (
    <label
      className="mb-3 block"
      htmlFor={`conversation-search-${searchInputId}`}
    >
      <span className="sr-only">Search users</span>
      <div className="relative text-muted-foreground">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          id={`conversation-search-${searchInputId}`}
          readOnly
          onFocus={onOpen}
          onClick={onOpen}
          placeholder="Search users"
          type="search"
          className="h-10 cursor-text rounded-full border-transparent bg-muted pl-9 pr-3"
        />
      </div>
    </label>
  );
}
