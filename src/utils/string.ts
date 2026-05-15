import type { User } from "@/types/user";

/*
Input: {"firstName":"A", "lastName":"B", "username":"username"}
Output: "A B"

Input: {"firstName":null, "lastName":null, "username":"username"}
Output: "username"
*/
export function getFullName(user: User) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.username;
}

export function parseToJson<T>(jsonString: string) {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    console.error("Unable to parse json string.");
    return null;
  }
}
