function getErrorText(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return "";
}

export function isRefreshTokenExpiredError(error: unknown) {
  const message = getErrorText(error).toLowerCase();

  return (
    message.includes("expired") &&
    (message.includes("refresh") ||
      message.includes("jwt") ||
      message.includes("session") ||
      message.includes("token"))
  );
}
