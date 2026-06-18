import { ChevronsUpDown } from "lucide-react";
import type * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { getUsernameLabel } from "@/utils/display";

type CurrentUserTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  ref?: React.Ref<HTMLButtonElement>;
  displayName: string;
  initials: string;
  avatarUrl?: string;
  username: string;
};

export function CurrentUserTrigger({
  className,
  displayName,
  initials,
  avatarUrl,
  username,
  ref,
  ...buttonProps
}: CurrentUserTriggerProps) {
  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      className={cn(
        "h-auto w-full justify-between rounded-xl px-3 py-2 text-left whitespace-normal hover:bg-accent border",
        className,
      )}
      {...buttonProps}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar className="size-9 bg-muted">
          {avatarUrl ? (
            <AvatarImage
              alt={displayName}
              className="object-cover"
              src={avatarUrl}
            />
          ) : null}
          <AvatarFallback className="text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {getUsernameLabel(username)}
          </p>
        </div>
      </div>
      <ChevronsUpDown className="size-4 text-muted-foreground" />
    </Button>
  );
}
