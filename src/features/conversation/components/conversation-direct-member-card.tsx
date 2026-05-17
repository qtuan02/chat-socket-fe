import { DetailField } from "@/components/shared/detail-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ConversationMember } from "@/types/conversation";
import { formatDateTime } from "@/utils/date";
import {
  getDisplayNameInitials,
  getMemberPresenceLabel,
  getUsernameLabel,
} from "@/utils/display";

export function ConversationDirectMemberCard({
  member,
}: {
  member: ConversationMember;
}) {
  return (
    <>
      <div className="w-full flex justify-center">
        <Avatar className="size-40 border border-border bg-background text-muted-foreground shadow-sm">
          {member.avatarUrl ? (
            <AvatarImage
              alt={member.displayName}
              className="object-cover"
              src={member.avatarUrl}
            />
          ) : null}
          <AvatarFallback className="text-xl font-semibold">
            {getDisplayNameInitials(member.displayName)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="mt-4 grid gap-3">
        <DetailField label="Full name" value={member.displayName} />
        <DetailField
          label="Username"
          value={getUsernameLabel(member.username ?? undefined) ?? "-"}
        />
        <DetailField label="Bio" value={member.bio} />
        <DetailField label="Status" value={getMemberPresenceLabel(member)} />
        <DetailField label="Joined" value={formatDateTime(member.joinedAt)} />
      </div>
    </>
  );
}
