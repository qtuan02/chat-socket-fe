import { LogOut, PencilLine } from "lucide-react";
import { DetailField } from "@/components/shared/detail-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatCurrentUserProfileDialog } from "@/features/current-user/components/chat-current-user-profile-dialog";
import {
  CurrentUserError,
  CurrentUserSkeleton,
} from "@/features/current-user/components/chat-current-user-section-state";
import { useCurrentUserSection } from "@/features/current-user/hooks/use-current-user-section";
import { presenceStatusLabels } from "@/types/user";
import { formatDateTime } from "@/utils/date";
import { getUsernameLabel } from "@/utils/display";

function ProfileAvatar({
  avatarUrl,
  displayName,
  initials,
}: {
  avatarUrl?: string;
  displayName: string;
  initials: string;
}) {
  return (
    <Avatar className="size-10 border bg-muted">
      {avatarUrl ? (
        <AvatarImage
          alt={displayName}
          className="object-cover"
          src={avatarUrl}
        />
      ) : null}
      <AvatarFallback className="text-sm font-semibold leading-none">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function CurrentUserProfileTemplate() {
  const {
    currentUser,
    errorMessage,
    isCurrentUserFetching,
    isEditingProfile,
    isError,
    isLoading,
    isProfileDialogOpen,
    isSignOutPending,
    isUpdateProfilePending,
    profileForm,
    displayName,
    displayInitials,
    handleProfileDialogOpenChange,
    handleProfileInputChange,
    startEditingProfile,
    cancelEditingProfile,
    saveProfile,
    handleSignOut,
    refetchProfile,
  } = useCurrentUserSection();

  if (isLoading) {
    return <CurrentUserSkeleton />;
  }

  if (isError || !currentUser) {
    return (
      <CurrentUserError
        errorMessage={errorMessage ?? "Unable to load user profile."}
        isRetrying={isCurrentUserFetching}
        onRetry={() => {
          refetchProfile();
        }}
      />
    );
  }

  return (
    <section className="mx-auto flex min-h-0 flex-1 w-full max-w-5xl flex-col gap-4 overflow-y-auto p-3 md:min-h-0 md:flex-1 md:p-4 md:pb-6 md:overflow-hidden">
      <div className="rounded-xl border border-border bg-background px-3 py-2 md:px-4 md:py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <ProfileAvatar
              avatarUrl={currentUser.avatarUrl ?? undefined}
              displayName={displayName}
              initials={displayInitials}
            />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">{displayName}</h1>
              <p className="truncate text-xs text-muted-foreground">
                {getUsernameLabel(currentUser.username)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => {
              handleProfileDialogOpenChange(true);
              startEditingProfile();
            }}
            aria-label="Edit profile"
          >
            <PencilLine className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-background  p-3 md:p-4">
        <h2 className="text-sm font-semibold">Profile</h2>
        <DetailField label="Full name" value={displayName} />
        <DetailField label="Bio" value={currentUser.bio} />
        <DetailField label="Username" value={currentUser.username} />
        <DetailField label="Email" value={currentUser.email} />
        <DetailField
          label="Phone"
          value={currentUser.phone || "Not provided"}
        />
        <DetailField label="Role" value={currentUser.role || "-"} />
        <DetailField label="User ID" value={currentUser.id} />
        <DetailField
          label="Created at"
          value={formatDateTime(currentUser.createdAt)}
        />
        <DetailField
          label="Last updated"
          value={formatDateTime(currentUser.updatedAt)}
        />
        <DetailField
          label="Status"
          value={
            currentUser.presenceStatus
              ? presenceStatusLabels[currentUser.presenceStatus]
              : "Unavailable"
          }
        />

        <Button
          type="button"
          variant="outline"
          className="mt-2 border-destructive/40 text-destructive"
          onClick={handleSignOut}
          disabled={isSignOutPending}
        >
          <LogOut className="size-4" />
          {isSignOutPending ? "Signing out..." : "Sign out"}
        </Button>
      </div>

      <ChatCurrentUserProfileDialog
        isOpen={isProfileDialogOpen}
        onProfileDialogOpenChange={handleProfileDialogOpenChange}
        isEditingProfile={isEditingProfile}
        isUpdateProfilePending={isUpdateProfilePending}
        profileForm={profileForm}
        currentUser={currentUser}
        displayName={displayName}
        onProfileInputChange={handleProfileInputChange}
        startEditingProfile={startEditingProfile}
        cancelEditingProfile={cancelEditingProfile}
        saveProfile={saveProfile}
      />
    </section>
  );
}
