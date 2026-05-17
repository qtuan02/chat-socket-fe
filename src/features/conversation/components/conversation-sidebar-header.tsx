import { MessageCircle, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConversationSidebarHeaderProps = {
  onCreateGroupClick: () => void;
};

export function ConversationSidebarHeader({
  onCreateGroupClick,
}: ConversationSidebarHeaderProps) {
  return (
    <div className="flex h-16 items-center gap-2 border-b px-4">
      <MessageCircle className="size-7 text-primary" />
      <h1 className="text-2xl font-semibold">Conversations</h1>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="ml-auto"
        onClick={onCreateGroupClick}
      >
        <UsersRound className="size-4" />
        <span className="sr-only">Create group conversation</span>
      </Button>
    </div>
  );
}
