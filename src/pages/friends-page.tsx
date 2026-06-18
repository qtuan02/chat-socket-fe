import { useNavigate } from "react-router";
import { MobileTopBackBar } from "@/components/shared/mobile-top-back-bar";
import { APP_ROUTES } from "@/config/routes";
import { ChatShellLayout } from "@/features/chat/templates/chat-shell-layout";
import { FriendsTemplate } from "@/features/friends/templates/friends-template";

export function FriendsPage() {
  const navigate = useNavigate();

  return (
    <ChatShellLayout>
      <div className="md:hidden">
        <MobileTopBackBar
          title="Friends"
          onBack={() => {
            navigate(APP_ROUTES.chat);
          }}
        />
      </div>
      <FriendsTemplate />
    </ChatShellLayout>
  );
}
