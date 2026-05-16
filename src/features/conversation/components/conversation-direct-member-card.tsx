import { DetailField } from "@/components/shared/detail-field";
import type { ConversationMember } from "@/types/conversation";
import { formatDateTime } from "@/utils/date";
import { getDisplayNameInitials, getUsernameLabel } from "@/utils/user-display";
import { getMemberPresenceLabel } from "../utils/conversation-display";

export function ConversationDirectMemberCard({
  member,
}: {
  member: ConversationMember;
}) {
  return (
    <>
      <div className="w-full flex justify-center">
        {member.avatarUrl ? (
          <img
            alt={member.displayName}
            className="size-40 rounded-full border border-border bg-background text-xl font-semibold text-muted-foreground shadow-sm object-cover"
            src={member.avatarUrl}
          />
        ) : (
          <div className="relative inline-flex size-40 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-xl font-semibold text-muted-foreground shadow-sm">
            <span>{getDisplayNameInitials(member.displayName)}</span>
          </div>
        )}
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
