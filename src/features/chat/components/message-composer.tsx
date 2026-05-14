import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type MessageComposerProps = {
  className?: string;
  isDisabled?: boolean;
  isSending?: boolean;
};

export function MessageComposer({
  className,
  isSending = false,
}: MessageComposerProps) {
  const actionLabel = isSending ? "Sending..." : "Send";

  return (
    <div className={cn("border-t border-border p-4", className)}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="relative">
          <textarea
            rows={3}
            aria-label="Message composer"
            placeholder="Type a message..."
            className="w-full min-h-20 resize-none rounded-md border border-input bg-muted/20 px-3 py-2 text-sm shadow-sm outline-none ring-0 transition disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button type="button" size="icon" variant="outline">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach</span>
            </Button>
            <Button type="button" size="icon" variant="outline">
              <Smile className="size-4" />
              <span className="sr-only">Emoji</span>
            </Button>
          </div>
          <Button type="button" variant="default">
            <Send className="size-4" />
            {actionLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
