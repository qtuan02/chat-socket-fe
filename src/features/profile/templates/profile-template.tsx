import { AlertCircle, Eye, Loader2, LogOut, UserRound } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUserQuery } from "@/hooks/api/user";
import { cn } from "@/utils/cn";
import { ProfileBasicInfo } from "../components/profile-basic-info";
import { ProfileDetailDialog } from "../components/profile-detail-dialog";

type ProfileTemplateProps = {
  className?: string;
  isSignOutPending?: boolean;
  onSignOut?: () => void;
  variant?: "compact" | "full";
};

export function ProfileTemplate({
  className,
  isSignOutPending = false,
  onSignOut,
  variant = "compact",
}: ProfileTemplateProps) {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const {
    data: currentUser,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCurrentUserQuery();

  const submitError = isError
    ? error instanceof Error && error.message
      ? error.message
      : "Unable to load user profile."
    : null;

  const openDetails = () => {
    setIsDetailDialogOpen(true);
  };

  const closeDetails = () => {
    setIsDetailDialogOpen(false);
  };

  if (variant === "compact") {
    if (isLoading) {
      return (
        <section className={cn("w-full", className)}>
          <div className="inline-flex w-full items-center gap-2 rounded-xl border border-dashed bg-background px-3 py-2.5 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </section>
      );
    }

    if (isError) {
      return (
        <section className={cn("w-full", className)}>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
            <div className="mb-2 flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4" />
              <span>Unable to load profile.</span>
            </div>
            <Button
              onClick={() => void refetch()}
              disabled={isFetching}
              size="sm"
              variant="outline"
            >
              {isFetching ? "Retrying..." : "Retry"}
            </Button>
          </div>
        </section>
      );
    }

    if (!currentUser) {
      return (
        <section className={cn("w-full", className)}>
          <div className="rounded-xl border border-dashed bg-background px-3 py-2.5 text-xs text-muted-foreground">
            <p>Profile data is empty.</p>
            <Button
              onClick={() => void refetch()}
              disabled={isFetching}
              size="sm"
              variant="outline"
              className="mt-2 h-7 px-2.5"
            >
              {isFetching ? "Retrying..." : "Reload"}
            </Button>
          </div>
        </section>
      );
    }

    return (
      <section className={cn("w-full", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex w-full items-center justify-between gap-2 rounded-xl border bg-background px-3 py-2.5 text-left transition hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="bg-muted inline-flex size-8 shrink-0 items-center justify-center rounded-full border">
                  <UserRound className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {currentUser.firstName || currentUser.lastName
                      ? `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim()
                      : currentUser.username}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{currentUser.username}
                  </p>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-52">
            <DropdownMenuItem onClick={openDetails}>
              <Eye className="mr-2 size-4" />
              View profile details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (onSignOut) {
                  onSignOut();
                }
              }}
              disabled={!onSignOut || isSignOutPending}
            >
              <LogOut className="mr-2 size-4 text-red-500" />
              <span className="text-red-500">
                {isSignOutPending ? "Signing out..." : "Sign out"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ProfileDetailDialog
          user={currentUser}
          open={isDetailDialogOpen}
          onOpenChange={closeDetails}
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className={cn("w-full", className)}>
        <Card>
          <CardContent className="flex items-center justify-center px-6 py-16">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading profile...
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={cn("w-full", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              Unable to load profile
            </CardTitle>
            <CardDescription>{submitError}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? "Retrying..." : "Retry"}
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className={cn("w-full", className)}>
        <Card>
          <CardHeader>
            <CardTitle>No profile data</CardTitle>
            <CardDescription>
              Your profile response is empty. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? "Retrying..." : "Reload"}
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className={cn("w-full", className)}>
      <ProfileBasicInfo user={currentUser} onViewDetails={openDetails} />
      <ProfileDetailDialog
        user={currentUser}
        open={isDetailDialogOpen}
        onOpenChange={closeDetails}
      />
    </section>
  );
}
