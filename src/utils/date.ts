/*
Input: 1970-01-01T00:00:00.000Z
Output: 01/01
Input: 1970-01-01T00:00:00.000Z
Output: 01/01/70
*/
export function formatTimestamp(timestamp: string) {
  const messageDate = new Date(timestamp);

  if (Number.isNaN(messageDate.getTime())) return timestamp;

  const now = new Date();
  const diffInMs = now.getTime() - messageDate.getTime();
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const oneWeekInMs = 7 * oneDayInMs;
  const oneYearInMs = 365 * oneDayInMs;

  if (diffInMs <= oneDayInMs)
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  if (diffInMs <= oneWeekInMs)
    return messageDate.toLocaleDateString([], { weekday: "long" });

  const day = String(messageDate.getDate()).padStart(2, "0");
  const month = String(messageDate.getMonth() + 1).padStart(2, "0");

  if (diffInMs <= oneYearInMs) return `${day}/${month}`;

  const year = String(messageDate.getFullYear()).slice(-2).padStart(2, "0");

  return `${day}/${month}/${year}`;
}

/*
Input: 1970-01-01T00:00:00.000Z
Output: 01 jan
Input: 1970-01-01T00:00:00.000Z
Output: 01 jan 1970
*/
export function formatMessageDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });

  const currentYear = new Date().getFullYear();
  if (date.getFullYear() === currentYear) return `${day} ${month}`;

  return `${day} ${month} ${date.getFullYear()}`;
}

/*
Input: 1970-01-01T00:00:00.000Z
Output: 01/01/1970, 00:00:00
*/
export function formatDateTime(value?: string) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString();
}

/**
 * Input: 1970-01-01T00:00:00.000Z
 * Output: 00:00
 */
export const formatTime = (createdAt: string) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const oneDayInMs = 24 * 60 * 60 * 1000;

  if (diffInMs <= oneDayInMs)
    return date.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return date.toLocaleString();
};
