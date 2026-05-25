import { ChatCurrentUserSection } from "@/features/current-user/components/chat-current-user-section";

type CurrentUserSidebarSectionProps = {
  className?: string;
};

export function CurrentUserSidebarSection({
  className,
}: CurrentUserSidebarSectionProps) {
  return <ChatCurrentUserSection className={className} />;
}
