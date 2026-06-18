import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PresenceStatusEnum } from "@/types/user";
import { cn } from "@/utils/cn";
import { getDisplayNameInitials } from "@/utils/display";

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
      <Avatar
        className={cn(
          "bg-muted text-muted-foreground",
          resolvedAvatarSizeClassName,
        )}
      >
        {avatarUrl ? <AvatarImage alt={displayName} src={avatarUrl} /> : null}
        <AvatarFallback
          className={cn(
            "font-semibold leading-none",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {getDisplayNameInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      {presenceStatus ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            compact ? "size-2.5" : "size-3",
            presenceStatus === PresenceStatusEnum.Online && "bg-online",
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
