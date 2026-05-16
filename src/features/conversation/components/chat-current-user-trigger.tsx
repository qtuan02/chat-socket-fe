import { ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/utils/cn";
import { getUsernameLabel } from "@/utils/user-display";

type CurrentUserTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  displayName: string;
  initials: string;
  avatarUrl?: string;
  username: string;
};

export const CurrentUserTrigger = React.forwardRef<
  HTMLButtonElement,
  CurrentUserTriggerProps
>(
  (
    { className, displayName, initials, avatarUrl, username, ...buttonProps },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex w-full items-center justify-between gap-2 rounded-xl border bg-background px-3 py-2 text-left transition hover:border-primary/30 hover:bg-primary/5",
        className,
      )}
      {...buttonProps}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-full border">
          {avatarUrl ? (
            <img
              alt={displayName}
              className="size-9 rounded-full object-cover"
              src={avatarUrl}
            />
          ) : (
            <span className="text-xs font-semibold">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {getUsernameLabel(username)}
          </p>
        </div>
      </div>
      <ChevronsUpDown className="size-4 text-muted-foreground" />
    </button>
  ),
);

CurrentUserTrigger.displayName = "CurrentUserTrigger";
