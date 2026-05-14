import { CircleCheckBig, Users } from "lucide-react";
import type { Conversation } from "../types/chat";

type ChatHeaderProps = {
  conversation: Conversation;
  isSignOutPending: boolean;
  onSignOut: () => void;
};

export function ChatHeader({ conversation }: ChatHeaderProps) {
  return (
    <header className="border-b border-border px-4 py-3 md:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold leading-tight">
            {conversation.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {conversation.participantCount} members
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          <span>Active</span>
          <CircleCheckBig className="size-3.5 text-green-500" />
        </div>
      </div>
    </header>
  );
}
