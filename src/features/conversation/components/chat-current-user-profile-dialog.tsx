import { DetailField } from "@/components/shared/detail-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { UpdateUserRequestPayload, User } from "@/types/user";
import { presenceStatusLabels } from "@/types/user";
import { formatDateTime } from "@/utils/date";

type ProfileInputFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
};

type ProfileTextAreaFieldProps = ProfileInputFieldProps;

type ProfileFormFieldsProps = {
  profileForm: {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
    phone?: string;
  };
  onChange: (field: keyof UpdateUserRequestPayload, value: string) => void;
};

type ChatCurrentUserProfileDialogProps = {
  isOpen: boolean;
  onProfileDialogOpenChange: (nextOpen: boolean) => void;
  isEditingProfile: boolean;
  isUpdateProfilePending: boolean;
  profileForm: ProfileFormFieldsProps["profileForm"];
  currentUser: User;
  displayName: string;
  onProfileInputChange: ProfileFormFieldsProps["onChange"];
  startEditingProfile: () => void;
  cancelEditingProfile: () => void;
  saveProfile: () => void;
};

function ProfileInputField({
  id,
  label,
  value,
  onChange,
}: ProfileInputFieldProps) {
  return (
    <div className="grid gap-1">
      <label className="text-xs text-muted-foreground" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </div>
  );
}

function ProfileTextAreaField({
  id,
  label,
  value,
  onChange,
}: ProfileTextAreaFieldProps) {
  return (
    <div className="grid gap-1">
      <label className="text-xs text-muted-foreground" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
        rows={3}
      />
    </div>
  );
}

function ProfileFormFields({ profileForm, onChange }: ProfileFormFieldsProps) {
  return (
    <section className="grid gap-3">
      <ProfileInputField
        id="profile-username"
        label="Username"
        value={profileForm.username ?? ""}
        onChange={(nextValue) => {
          onChange("username", nextValue);
        }}
      />
      <ProfileInputField
        id="profile-email"
        label="Email"
        value={profileForm.email ?? ""}
        onChange={(nextValue) => {
          onChange("email", nextValue);
        }}
      />
      <ProfileInputField
        id="profile-firstName"
        label="First name"
        value={profileForm.firstName ?? ""}
        onChange={(nextValue) => {
          onChange("firstName", nextValue);
        }}
      />
      <ProfileInputField
        id="profile-lastName"
        label="Last name"
        value={profileForm.lastName ?? ""}
        onChange={(nextValue) => {
          onChange("lastName", nextValue);
        }}
      />
      <ProfileInputField
        id="profile-avatarUrl"
        label="Avatar URL"
        value={profileForm.avatarUrl ?? ""}
        onChange={(nextValue) => {
          onChange("avatarUrl", nextValue);
        }}
      />
      <ProfileInputField
        id="profile-phone"
        label="Phone"
        value={profileForm.phone ?? ""}
        onChange={(nextValue) => {
          onChange("phone", nextValue);
        }}
      />
      <ProfileTextAreaField
        id="profile-bio"
        label="Bio"
        value={profileForm.bio ?? ""}
        onChange={(nextValue) => {
          onChange("bio", nextValue);
        }}
      />
      <p className="text-xs text-muted-foreground">
        Use empty text to clear optional fields.
      </p>
    </section>
  );
}

export function ChatCurrentUserProfileDialog({
  isOpen,
  onProfileDialogOpenChange,
  isEditingProfile,
  isUpdateProfilePending,
  profileForm,
  currentUser,
  displayName,
  onProfileInputChange,
  startEditingProfile,
  cancelEditingProfile,
  saveProfile,
}: ChatCurrentUserProfileDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onProfileDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile details</DialogTitle>
          <DialogDescription>
            {isEditingProfile
              ? "Update your personal profile details."
              : "Read-only user profile details from your current session."}
          </DialogDescription>
        </DialogHeader>

        {isEditingProfile ? (
          <ProfileFormFields
            profileForm={profileForm}
            onChange={onProfileInputChange}
          />
        ) : (
          <section className="grid gap-3">
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
          </section>
        )}

        <DialogFooter>
          {isEditingProfile ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={cancelEditingProfile}
                disabled={isUpdateProfilePending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={saveProfile}
                disabled={isUpdateProfilePending}
              >
                {isUpdateProfilePending ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={startEditingProfile}>
              Edit profile
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
