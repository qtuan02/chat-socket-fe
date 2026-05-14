import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "@/types/user";

type ProfileDetailDialogProps = {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDate(value?: string) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString();
}

function ProfileDetailField({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <dl className="grid gap-1">
      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </dt>
      <dd className="font-medium break-all">{value ?? "-"}</dd>
    </dl>
  );
}

function getFullName(user: User) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.username;
}

export function ProfileDetailDialog({
  user,
  open,
  onOpenChange,
}: ProfileDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile details</DialogTitle>
          <DialogDescription>
            Read-only user profile details from your current session.
          </DialogDescription>
        </DialogHeader>
        <section className="grid gap-3">
          <ProfileDetailField label="Full name" value={getFullName(user)} />
          <ProfileDetailField label="Username" value={user.username} />
          <ProfileDetailField label="Email" value={user.email} />
          <ProfileDetailField
            label="Phone"
            value={user.phone || "Not provided"}
          />
          <ProfileDetailField label="Role" value={user.role || "-"} />
          <ProfileDetailField label="Bio" value={user.bio || "No bio"} />
          <ProfileDetailField label="User ID" value={user.id} />
          <ProfileDetailField
            label="Created at"
            value={formatDate(user.createdAt)}
          />
          <ProfileDetailField
            label="Last updated"
            value={formatDate(user.updatedAt)}
          />
          <ProfileDetailField label="Status" value={user.status} />
        </section>
      </DialogContent>
    </Dialog>
  );
}
