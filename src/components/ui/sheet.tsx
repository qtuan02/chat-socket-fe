import { X } from "lucide-react";
import * as DialogPrimitive from "radix-ui";
import type * as React from "react";

import { cn } from "@/utils/cn";

type SheetSide = "top" | "bottom" | "left" | "right";

const SIDE_STYLES: Record<SheetSide, string> = {
  top: "inset-x-0 top-0 border-b border-border duration-300 data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
  bottom:
    "inset-x-0 bottom-0 border-t border-border duration-300 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  left: "inset-y-0 left-0 h-full w-3/4 border-r border-border p-6 duration-200 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left sm:max-w-sm",
  right:
    "inset-y-0 right-0 h-full w-3/4 border-l border-border p-6 duration-200 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right sm:max-w-sm",
};

const Sheet = DialogPrimitive.Dialog.Root;
const SheetTrigger = DialogPrimitive.Dialog.Trigger;
const SheetClose = DialogPrimitive.Dialog.Close;
const SheetPortal = DialogPrimitive.Dialog.Portal;

function SheetOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog.Overlay>) {
  return (
    <DialogPrimitive.Dialog.Overlay
      className={cn(
        "bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "fixed inset-0 z-50 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog.Content> & {
  side?: SheetSide;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Dialog.Content
        className={cn(
          "bg-background fixed z-50 flex flex-col shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          SIDE_STYLES[side as keyof typeof SIDE_STYLES],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Dialog.Close className="ring-offset-background text-muted-foreground hover:text-foreground absolute right-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Dialog.Close>
      </DialogPrimitive.Dialog.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mb-2 grid gap-1.5 text-left", className)} {...props} />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
