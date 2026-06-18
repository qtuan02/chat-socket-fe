import { MessageCircle, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConversationSidebarHeaderProps = {
  onCreateGroupClick: () => void;
};

export function ConversationSidebarHeader({
  onCreateGroupClick,
}: ConversationSidebarHeaderProps) {
  return (
    <div className="flex h-16 items-center gap-2 px-4">
      <MessageCircle className="size-6 text-primary" />
      <h1 className="text-xl font-bold">Conversations</h1>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="ml-auto rounded-full bg-muted hover:bg-accent"
        onClick={onCreateGroupClick}
      >
        <UsersRound className="size-4" />
        <span className="sr-only">Create group conversation</span>
      </Button>
    </div>
  );
}
