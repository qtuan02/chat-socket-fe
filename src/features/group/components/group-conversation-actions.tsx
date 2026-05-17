import { LogOut, PencilLine, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type GroupConversationActionsProps = {
  isLeaveGroupSubmitting: boolean;
  onAddMembersClick: () => void;
  onLeaveGroupClick: () => void;
  onRenameGroupClick: () => void;
};

export function GroupConversationActions({
  isLeaveGroupSubmitting,
  onAddMembersClick,
  onLeaveGroupClick,
  onRenameGroupClick,
}: GroupConversationActionsProps) {
  return (
    <section className="grid gap-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Group actions
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="outline" onClick={onRenameGroupClick}>
          <PencilLine className="size-4" />
          Rename group
        </Button>

        <Button type="button" variant="outline" onClick={onAddMembersClick}>
          <UserPlus className="size-4" />
          Add members
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onLeaveGroupClick}
          disabled={isLeaveGroupSubmitting}
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive sm:col-span-2 sm:justify-center"
        >
          <LogOut className="size-4" />
          {isLeaveGroupSubmitting ? "Leaving..." : "Leave group"}
        </Button>
      </div>
    </section>
  );
}
