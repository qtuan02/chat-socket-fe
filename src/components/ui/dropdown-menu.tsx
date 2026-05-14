import * as DropdownMenuPrimitive from "radix-ui";
import type * as React from "react";

import { cn } from "@/utils/cn";

function DropdownMenu({
  ...props
}: React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.DropdownMenu.Root
>) {
  return <DropdownMenuPrimitive.DropdownMenu.Root {...props} />;
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.DropdownMenu.Trigger
>) {
  return <DropdownMenuPrimitive.DropdownMenu.Trigger {...props} />;
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.DropdownMenu.Content
>) {
  return (
    <DropdownMenuPrimitive.DropdownMenu.Portal>
      <DropdownMenuPrimitive.DropdownMenu.Content
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.DropdownMenu.Portal>
  );
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.DropdownMenu.Item
>) {
  return (
    <DropdownMenuPrimitive.DropdownMenu.Item
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.DropdownMenu.Label
> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.DropdownMenu.Label
      className={cn(
        "text-muted-foreground px-2 py-1.5 text-xs font-medium",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.DropdownMenu.Separator
>) {
  return (
    <DropdownMenuPrimitive.DropdownMenu.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.DropdownMenu.Group
>) {
  return <DropdownMenuPrimitive.DropdownMenu.Group {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
