import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import { useSignOutMutation } from "@/hooks/api/auth";
import {
  useCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from "@/hooks/api/user";
import useAuthStore from "@/stores/useAuthStore";
import type { UpdateUserRequestPayload, User } from "@/types/user";
import { getDisplayName, getDisplayNameInitials } from "@/utils/display";

type CurrentUserSectionState = {
  currentUser: User | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isSignOutPending: boolean;
  isCurrentUserFetching: boolean;
  isProfileDialogOpen: boolean;
  isEditingProfile: boolean;
  isUpdateProfilePending: boolean;
  profileForm: UpdateUserRequestPayload;
  displayName: string;
  displayInitials: string;
};

type CurrentUserSectionActions = {
  handleProfileDialogOpenChange: (nextOpen: boolean) => void;
  handleProfileInputChange: (
    field: keyof UpdateUserRequestPayload,
    value: string,
  ) => void;
  startEditingProfile: () => void;
  cancelEditingProfile: () => void;
  saveProfile: () => void;
  handleSignOut: () => void;
  refetchProfile: () => void;
};

export function useCurrentUserSection() {
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
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileForm, setProfileForm] =
    React.useState<UpdateUserRequestPayload>({});
  const { mutateAsync: signOut, isPending: isSignOutPending } =
    useSignOutMutation({
      onSuccess: () => {
        queryClient.clear();
        clearAuthState();
        navigate(APP_ROUTES.signIn, { replace: true });
      },
      onError: () => {
        toast.error("Sign out failed. Please try again.");
      },
    });
  const { mutate: updateCurrentUser, isPending: isUpdateProfilePending } =
    useUpdateCurrentUserMutation({
      onSuccess: () => {
        setIsEditingProfile(false);
      },
    });

  const resetProfileForm = React.useCallback(() => {
    setProfileForm({
      username: currentUser?.username,
      email: currentUser?.email ?? undefined,
      firstName: currentUser?.firstName,
      lastName: currentUser?.lastName,
      avatarUrl: currentUser?.avatarUrl ?? undefined,
      bio: currentUser?.bio ?? undefined,
      phone: currentUser?.phone ?? undefined,
    });
  }, [currentUser]);

  React.useEffect(() => {
    if (currentUser) {
      resetProfileForm();
    }
  }, [currentUser, resetProfileForm]);

  const handleProfileDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setIsProfileDialogOpen(nextOpen);
      if (!nextOpen) {
        setIsEditingProfile(false);
        resetProfileForm();
      }
    },
    [resetProfileForm],
  );

  const handleProfileInputChange = React.useCallback(
    (field: keyof UpdateUserRequestPayload, value: string) => {
      setProfileForm((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    [],
  );

  const startEditingProfile = React.useCallback(() => {
    setIsEditingProfile(true);
  }, []);

  const cancelEditingProfile = React.useCallback(() => {
    setIsEditingProfile(false);
    resetProfileForm();
  }, [resetProfileForm]);

  const saveProfile = React.useCallback(() => {
    if (!currentUser || isUpdateProfilePending) return;

    const payload: UpdateUserRequestPayload = {
      username: profileForm.username?.trim(),
      email: profileForm.email?.trim(),
      firstName: profileForm.firstName?.trim(),
      lastName: profileForm.lastName?.trim(),
      avatarUrl: profileForm.avatarUrl?.trim(),
      bio: profileForm.bio?.trim() ?? "",
      phone: profileForm.phone?.trim(),
    };

    if (
      !payload.username &&
      !payload.email &&
      !payload.firstName &&
      !payload.lastName
    ) {
      return;
    }

    updateCurrentUser(payload);
  }, [
    currentUser,
    isUpdateProfilePending,
    profileForm.bio,
    profileForm.avatarUrl,
    profileForm.email,
    profileForm.firstName,
    profileForm.lastName,
    profileForm.phone,
    profileForm.username,
    updateCurrentUser,
  ]);

  const handleSignOut = React.useCallback(() => {
    if (isSignOutPending) return;
    void signOut();
  }, [isSignOutPending, signOut]);

  const refetchProfile = React.useCallback(() => {
    void refetch();
  }, [refetch]);

  const displayName = currentUser ? getDisplayName(currentUser) : "-";
  const displayInitials = currentUser
    ? getDisplayNameInitials(getDisplayName(currentUser))
    : "--";
  const submitError =
    isCurrentUserError && currentUserError instanceof Error
      ? currentUserError.message
      : null;

  const state: CurrentUserSectionState = {
    currentUser,
    isLoading: isCurrentUserLoading,
    isError: isCurrentUserError,
    errorMessage: submitError,
    isSignOutPending,
    isCurrentUserFetching,
    isProfileDialogOpen,
    isEditingProfile,
    isUpdateProfilePending,
    profileForm,
    displayName,
    displayInitials,
  };
  const actions: CurrentUserSectionActions = {
    handleProfileDialogOpenChange,
    handleProfileInputChange,
    startEditingProfile,
    cancelEditingProfile,
    saveProfile,
    handleSignOut,
    refetchProfile,
  };

  return {
    ...state,
    ...actions,
  };
}
