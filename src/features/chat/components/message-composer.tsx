import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type MessageComposerProps = {
  className?: string;
};

export function MessageComposer({ className }: MessageComposerProps) {
  return (
    <div className={cn("border-t border-border p-4 md:p-5", className)}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="relative">
          <textarea
            rows={3}
            disabled
            aria-label="Message composer"
            placeholder="Type a message (feature not implemented)"
            className="w-full min-h-20 resize-none rounded-md border border-input bg-muted/20 px-3 py-2 text-sm shadow-sm outline-none ring-0 transition disabled:cursor-not-allowed disabled:opacity-70"
          />
          <p className="absolute right-2 bottom-2 text-[10px] text-muted-foreground">
            UI preview only
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button type="button" size="icon" variant="outline" disabled>
              <Paperclip className="size-4" />
              <span className="sr-only">Attach</span>
            </Button>
            <Button type="button" size="icon" variant="outline" disabled>
              <Smile className="size-4" />
              <span className="sr-only">Emoji</span>
            </Button>
          </div>
          <Button type="button" variant="default" disabled>
            <Send className="size-4" />
            Send
          </Button>
        </div>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">
        Message sending is intentionally disabled in this static UI.
      </p>
    </div>
  );
}
