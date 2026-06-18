import { useNavigate } from "react-router";
import { MobileTopBackBar } from "@/components/shared/mobile-top-back-bar";
import { APP_ROUTES } from "@/config/routes";
import { ChatShellLayout } from "@/features/chat/templates/chat-shell-layout";
import { CurrentUserProfileTemplate } from "@/features/current-user/templates/current-user-profile-template";

export function ProfilePage() {
  const navigate = useNavigate();

  return (
    <ChatShellLayout>
      <div className="md:hidden">
        <MobileTopBackBar
          title="Profile"
          onBack={() => {
            navigate(APP_ROUTES.chat);
          }}
        />
      </div>
      <CurrentUserProfileTemplate />
    </ChatShellLayout>
  );
}
