import { PresenceStatusEnum } from "@/types/user";
import { cn } from "@/utils/cn";
import { getDisplayNameInitials } from "@/utils/user-display";

type UserItemAvatarProps = {
  compact: boolean;
  displayName: string;
  avatarUrl?: string;
  presenceStatus?: PresenceStatusEnum;
  avatarSizeClassName?: string;
};

export function UserItemAvatar({
  compact,
  displayName,
  avatarUrl,
  presenceStatus,
  avatarSizeClassName,
}: UserItemAvatarProps) {
  const resolvedAvatarSizeClassName =
    avatarSizeClassName ?? (compact ? "size-8" : "size-10");

  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground shadow-sm",
          resolvedAvatarSizeClassName,
        )}
      >
        {avatarUrl ? (
          <img
            alt={displayName}
            className={cn(
              "rounded-full object-cover",
              resolvedAvatarSizeClassName,
            )}
            src={avatarUrl}
          />
        ) : (
          <span
            className={[
              "font-semibold leading-none",
              compact ? "text-xs" : "text-sm",
            ].join(" ")}
          >
            {getDisplayNameInitials(displayName)}
          </span>
        )}
      </span>
      {presenceStatus ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            compact ? "size-2.5" : "size-3",
            presenceStatus === PresenceStatusEnum.Online && "bg-emerald-500",
            presenceStatus === PresenceStatusEnum.Offline &&
              "bg-muted-foreground/50",
            presenceStatus === PresenceStatusEnum.Checking &&
              "bg-muted-foreground/25",
          )}
        />
      ) : null}
    </span>
  );
}
