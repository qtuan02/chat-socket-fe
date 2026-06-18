import { LogOut, UserPlus, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_ROUTES } from "@/config/routes";
import { useCurrentUserSection } from "@/features/current-user/hooks/use-current-user-section";
import { cn } from "@/utils/cn";
import { ChatCurrentUserProfileDialog } from "./chat-current-user-profile-dialog";
import {
  CurrentUserError,
  CurrentUserSkeleton,
} from "./chat-current-user-section-state";
import { CurrentUserTrigger } from "./chat-current-user-trigger";

type ChatCurrentUserSectionProps = {
  className?: string;
};

export function ChatCurrentUserSection({
  className,
}: ChatCurrentUserSectionProps) {
  const navigate = useNavigate();
  const {
    currentUser,
    isError,
    isLoading,
    isUpdateProfilePending,
    isSignOutPending,
    isProfileDialogOpen,
    isCurrentUserFetching,
    isEditingProfile,
    profileForm,
    displayName,
    displayInitials,
    errorMessage,
    handleProfileDialogOpenChange,
    handleProfileInputChange,
    startEditingProfile,
    cancelEditingProfile,
    saveProfile,
    handleSignOut,
    refetchProfile,
  } = useCurrentUserSection();

  if (isLoading) {
    return <CurrentUserSkeleton className={className} />;
  }

  if (isError || !currentUser) {
    return (
      <CurrentUserError
        className={className}
        errorMessage={errorMessage ?? "Unable to load user profile."}
        isRetrying={isCurrentUserFetching}
        onRetry={() => {
          refetchProfile();
        }}
      />
    );
  }

  return (
    <section className={cn("hidden w-full p-4 md:block", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <CurrentUserTrigger
            displayName={displayName}
            initials={displayInitials}
            avatarUrl={currentUser.avatarUrl ?? undefined}
            username={currentUser.username}
          />
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
              handleProfileDialogOpenChange(true);
            }}
          >
            <UserRound className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              navigate(APP_ROUTES.friends);
            }}
          >
            <UserPlus className="mr-2 size-4" />
            Friends
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleSignOut}
            disabled={isSignOutPending}
          >
            <LogOut className="mr-2 size-4 text-destructive" />
            <span className="text-destructive">
              {isSignOutPending ? "Signing out..." : "Sign out"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
