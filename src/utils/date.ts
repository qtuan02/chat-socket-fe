import {
  APP_LOCALE,
  ONE_DAY_IN_MS,
  ONE_WEEK_IN_MS,
  ONE_YEAR_IN_MS,
} from "@/config/constant";

// All timestamps from the backend are UTC. These formatters omit `timeZone`,
// so Intl renders in the viewer's local timezone (UTC -> local conversion).
const appWeekdayFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  weekday: "long",
});

// Build numeric parts so the output order/format is fixed (dd/mm/yyyy,
// hh:mm:ss) regardless of the locale's default ordering. No `timeZone` =>
// rendered in the local timezone.
const appDatePartsFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

type AppDateParts = Record<
  "day" | "month" | "year" | "hour" | "minute" | "second",
  string
>;

function getDateParts(date: Date): AppDateParts {
  const parts = appDatePartsFormatter.formatToParts(date);
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    day: lookup("day"),
    month: lookup("month"),
    year: lookup("year"),
    hour: lookup("hour"),
    minute: lookup("minute"),
    second: lookup("second"),
  };
}

/** hh:mm */
function formatHourMinute(date: Date) {
  const { hour, minute } = getDateParts(date);
  return `${hour}:${minute}`;
}

/** dd/mm */
function formatDayMonth(date: Date) {
  const { day, month } = getDateParts(date);
  return `${day}/${month}`;
}

/** dd/mm/yyyy */
function formatDayMonthYear(date: Date) {
  const { day, month, year } = getDateParts(date);
  return `${day}/${month}/${year}`;
}

/** dd/mm/yyyy hh:mm:ss */
function formatFullDateTime(date: Date) {
  const { day, month, year, hour, minute, second } = getDateParts(date);
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

type RelativeDurationLabels = {
  noValueFallback: string;
  justNowLabel: string;
  minutesLabel: (value: number) => string;
  hoursLabel: (value: number) => string;
  daysLabel: (value: number) => string;
};

const HAS_TIMEZONE_REGEX = /([zZ])$|[+-]\d{2}:?\d{2}$/;

/**
 * Parse a backend timestamp into a Date instant.
 * Backend timestamps are UTC; when the string has no timezone designator
 * (no `Z` / no `±hh:mm` offset) we treat it as UTC instead of local time.
 * The resulting Date is then rendered in the viewer's local timezone.
 */
function parseUtcDate(value?: string | null) {
  if (!value) return null;

  const hasTime = value.includes("T") || value.includes(" ");
  const normalized =
    hasTime && !HAS_TIMEZONE_REGEX.test(value)
      ? `${value.replace(" ", "T")}Z`
      : value;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRelativeDuration(
  value: string | undefined,
  labels: RelativeDurationLabels,
) {
  if (!value) return labels.noValueFallback;

  const parsed = parseUtcDate(value);
  if (!parsed) return labels.noValueFallback;

  const diff = Date.now() - parsed.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return labels.justNowLabel;
  if (diff < hour)
    return labels.minutesLabel(Math.max(1, Math.floor(diff / minute)));
  if (diff < day)
    return labels.hoursLabel(Math.max(1, Math.floor(diff / hour)));

  return labels.daysLabel(Math.max(1, Math.floor(diff / day)));
}

export function formatRelativeTime(
  value?: string,
  fallback = "Time information is unavailable.",
) {
  return formatRelativeDuration(value, {
    noValueFallback: fallback,
    justNowLabel: "Just now",
    minutesLabel: (value) => `${value} minutes ago`,
    hoursLabel: (value) => `${value} hours ago`,
    daysLabel: (value) => `${value} days ago`,
  });
}

function formatRelativeDurationWithLabels(
  value?: string | null,
  labels?: RelativeDurationLabels,
) {
  return formatRelativeDuration(
    value ?? undefined,
    labels ?? {
      noValueFallback: "Time information is unavailable.",
      justNowLabel: "Just now",
      minutesLabel: (value) => `${value} minutes ago`,
      hoursLabel: (value) => `${value} hours ago`,
      daysLabel: (value) => `${value} days ago`,
    },
  );
}

export function formatRelativeActivity(
  value: string | null | undefined,
  labels: {
    noActivityLabel: string;
    activeJustNowLabel: string;
    activeMinutesLabel: (value: number) => string;
    activeHoursLabel: (value: number) => string;
    activeDaysLabel: (value: number) => string;
  },
) {
  return formatRelativeDurationWithLabels(value, {
    noValueFallback: labels.noActivityLabel,
    justNowLabel: labels.activeJustNowLabel,
    minutesLabel: labels.activeMinutesLabel,
    hoursLabel: labels.activeHoursLabel,
    daysLabel: labels.activeDaysLabel,
  });
}

export function formatTimestamp(timestamp?: string | null, fallback = "-") {
  if (!timestamp) return fallback;

  const messageDate = parseUtcDate(timestamp);

  if (!messageDate) return fallback;

  const now = new Date();
  const diffInMs = now.getTime() - messageDate.getTime();

  if (diffInMs <= ONE_DAY_IN_MS) return formatHourMinute(messageDate);

  if (diffInMs <= ONE_WEEK_IN_MS)
    return appWeekdayFormatter.format(messageDate);

  if (diffInMs <= ONE_YEAR_IN_MS) return formatDayMonth(messageDate);

  return formatDayMonthYear(messageDate);
}

export function formatMessageDate(value: string) {
  const date = parseUtcDate(value);
  if (!date) return value;

  const currentYear = getDateParts(new Date()).year;
  const messageYear = getDateParts(date).year;

  if (messageYear === currentYear) return formatDayMonth(date);

  return formatDayMonthYear(date);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const parsed = parseUtcDate(value);
  if (!parsed) return value;

  return formatFullDateTime(parsed);
}

export const formatTime = (createdAt: string) => {
  const date = parseUtcDate(createdAt);
  if (!date) return createdAt;

  return formatHourMinute(date);
};
