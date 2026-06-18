import { MessageCircle, UserRound, UserRoundSearch } from "lucide-react";
import { NavLink } from "react-router";
import { APP_ROUTES } from "@/config/routes";
import { cn } from "@/utils/cn";

const mobileBottomNavItems = [
  {
    href: APP_ROUTES.chat,
    label: "Conversations",
    icon: MessageCircle,
  },
  {
    href: APP_ROUTES.friends,
    label: "Friends",
    icon: UserRoundSearch,
  },
  {
    href: APP_ROUTES.profile,
    label: "Profile",
    icon: UserRound,
  },
];

export function MobileChatBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-stretch">
        {mobileBottomNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === APP_ROUTES.chat}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors active:text-foreground/85",
                  isActive && "text-primary",
                )
              }
              aria-label={item.label}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
