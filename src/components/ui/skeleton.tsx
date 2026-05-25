import type * as React from "react";
import { cn } from "@/utils/cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

export function Skeleton({ className, ref, ...props }: SkeletonProps) {
  return (
    <div
      ref={ref}
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  );
}
