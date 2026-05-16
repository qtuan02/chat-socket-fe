import type { User } from "@/types/user";

export type DisplayableNameInput = Pick<
  User,
  "firstName" | "lastName" | "username"
>;

export function getDisplayName(user: DisplayableNameInput) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return fullName || user.username;
}

export function getDisplayNameInitials(name?: string) {
  const normalizedName = (name ?? "").trim();

  if (!normalizedName) return "--";

  const parts = normalizedName.split(" ").filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
  }

  return normalizedName.slice(0, 2).toUpperCase();
}

export function getUsernameLabel(username?: string) {
  if (!username) return null;

  return username.startsWith("@") ? username : `@${username}`;
}
