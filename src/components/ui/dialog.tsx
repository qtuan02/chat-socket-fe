import { X } from "lucide-react";
import * as DialogPrimitive from "radix-ui";
import type * as React from "react";

import { cn } from "@/utils/cn";

function Dialog({
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog.Root>) {
  return <DialogPrimitive.Dialog.Root {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog.Trigger>) {
  return <DialogPrimitive.Dialog.Trigger {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog.Portal>) {
  return <DialogPrimitive.Dialog.Portal {...props} />;
}

function DialogClose({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog.Close>) {
  return (
    <DialogPrimitive.Dialog.Close
      className={cn(
        "absolute right-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog.Overlay>) {
  return (
    <DialogPrimitive.Dialog.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Dialog.Content
        className={cn(
          "bg-background text-foreground fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border p-6 shadow-lg duration-200 animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-0 sm:w-full",
          className,
        )}
        {...props}
      >
        {children}
        <DialogClose
          className={cn(
            "bg-background text-muted-foreground hover:text-foreground transition-colors",
            "ring-offset-background focus:ring-ring/50 rounded-md opacity-70 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none",
          )}
          aria-label="Close"
        >
          <X className="size-4" />
        </DialogClose>
      </DialogPrimitive.Dialog.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog.Title>) {
  return (
    <DialogPrimitive.Dialog.Title
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Dialog.Description>) {
  return (
    <DialogPrimitive.Dialog.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
