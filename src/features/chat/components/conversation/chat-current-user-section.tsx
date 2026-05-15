import { useQueryClient } from "@tanstack/react-query";
import { BellRing, ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_ROUTES } from "@/config/routes";
import { useSignOutMutation } from "@/hooks/api/auth";
import { currentUserQueryKeys, useCurrentUserQuery } from "@/hooks/api/user";
import useAuthStore from "@/stores/useAuthStore";
import type { User } from "@/types/user";
import { cn } from "@/utils/cn";

type ChatCurrentUserSectionProps = {
  className?: string;
};

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <dl className="grid gap-1">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium break-all">{value ?? "-"}</dd>
    </dl>
  );
}

function getDisplayName(user: User) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return fullName || user.username;
}

function getInitials(user: User) {
  if (user.firstName || user.lastName) {
    return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  }

  return user.username.slice(0, 2).toUpperCase();
}

export function ChatCurrentUserSection({
  className,
}: ChatCurrentUserSectionProps) {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuthState = useAuthStore((state) => state.clearState);
  const {
    data: currentUser,
    error: currentUserError,
    isError: isCurrentUserError,
    isFetching: isCurrentUserFetching,
    isLoading: isCurrentUserLoading,
    refetch,
  } = useCurrentUserQuery();
  const { mutateAsync: signOut, isPending: isSignOutPending } =
    useSignOutMutation({
      onSuccess: () => {
        clearAuthState();
        void queryClient.removeQueries({
          queryKey: currentUserQueryKeys.current(),
        });
        navigate(APP_ROUTES.signIn, { replace: true });
      },
    });

  const submitError = isCurrentUserError
    ? currentUserError instanceof Error && currentUserError.message
      ? currentUserError.message
      : "Unable to load user profile."
    : null;

  if (isCurrentUserLoading) {
    return (
      <section className={cn("w-full p-4", className)}>
        <div className="inline-flex w-full items-center justify-between gap-2 rounded-xl border bg-background px-3 py-2.5 text-left">
          <div className="flex min-w-0 items-center gap-2.5">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
          </div>
          <Skeleton className="size-4 rounded-md" />
        </div>
      </section>
    );
  }

  if (isCurrentUserError || !currentUser) {
    return (
      <section className={cn("w-full p-4", className)}>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
          <div className="mb-2 flex items-center gap-2 text-destructive">
            <span>{submitError ?? "Unable to load profile."}</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              void refetch();
            }}
            disabled={isCurrentUserFetching}
          >
            {isCurrentUserFetching ? "Retrying..." : "Retry"}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("w-full p-4", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex w-full items-center justify-between gap-2 rounded-xl border bg-background px-3 py-2 text-left transition hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-full border">
                {currentUser.avatarUrl ? (
                  <img
                    alt={getDisplayName(currentUser)}
                    className="size-9 rounded-full object-cover"
                    src={currentUser.avatarUrl}
                  />
                ) : (
                  <span className="text-xs font-semibold">
                    {getInitials(currentUser)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {getDisplayName(currentUser)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{currentUser.username}
                </p>
              </div>
            </div>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          className="w-56"
          alignOffset={-4}
        >
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setIsProfileDialogOpen(true);
            }}
          >
            <UserRound className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              toast.info("Notifications are not yet configured.");
            }}
          >
            <BellRing className="mr-2 size-4" />
            Notifications
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              if (!isSignOutPending) {
                void signOut();
              }
            }}
            disabled={isSignOutPending}
          >
            <LogOut className="mr-2 size-4 text-red-500" />
            <span className="text-red-500">
              {isSignOutPending ? "Signing out..." : "Sign out"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile details</DialogTitle>
            <DialogDescription>
              Read-only user profile details from your current session.
            </DialogDescription>
          </DialogHeader>
          <section className="grid gap-3">
            <ProfileField
              label="Full name"
              value={getDisplayName(currentUser)}
            />
            <ProfileField label="Username" value={currentUser.username} />
            <ProfileField label="Email" value={currentUser.email} />
            <ProfileField
              label="Phone"
              value={currentUser.phone || "Not provided"}
            />
            <ProfileField label="Role" value={currentUser.role || "-"} />
            <ProfileField label="User ID" value={currentUser.id} />
            <ProfileField
              label="Created at"
              value={formatDate(currentUser.createdAt)}
            />
            <ProfileField
              label="Last updated"
              value={formatDate(currentUser.updatedAt)}
            />
            <ProfileField label="Status" value={currentUser.status} />
          </section>
        </DialogContent>
      </Dialog>
    </section>
  );
}
