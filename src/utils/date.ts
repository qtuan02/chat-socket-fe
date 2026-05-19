import {
  APP_LOCALE,
  APP_TIME_ZONE,
  ONE_DAY_IN_MS,
  ONE_WEEK_IN_MS,
  ONE_YEAR_IN_MS,
} from "@/config/constant";

const appTimeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const appDateTimeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const appWeekdayFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  weekday: "long",
});

const appShortDateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
});

const appShortYearDateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

const appMessageDateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  day: "2-digit",
  month: "short",
});

const appMessageDateWithYearFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const appYearFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
});

type RelativeDurationLabels = {
  noValueFallback: string;
  justNowLabel: string;
  minutesLabel: (value: number) => string;
  hoursLabel: (value: number) => string;
  daysLabel: (value: number) => string;
};

function parseValidDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRelativeDuration(
  value: string | undefined,
  labels: RelativeDurationLabels,
) {
  if (!value) return labels.noValueFallback;

  const parsed = parseValidDate(value);
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

  const messageDate = parseValidDate(timestamp);

  if (!messageDate) return fallback;

  const now = new Date();
  const diffInMs = now.getTime() - messageDate.getTime();

  if (diffInMs <= ONE_DAY_IN_MS) return appTimeFormatter.format(messageDate);

  if (diffInMs <= ONE_WEEK_IN_MS)
    return appWeekdayFormatter.format(messageDate);

  if (diffInMs <= ONE_YEAR_IN_MS)
    return appShortDateFormatter.format(messageDate);

  return appShortYearDateFormatter.format(messageDate);
}

export function formatMessageDate(value: string) {
  const date = parseValidDate(value);
  if (!date) return value;

  const currentYear = appYearFormatter.format(new Date());
  const messageYear = appYearFormatter.format(date);

  if (messageYear === currentYear) return appMessageDateFormatter.format(date);

  return appMessageDateWithYearFormatter.format(date);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const parsed = parseValidDate(value);
  if (!parsed) return value;

  return appDateTimeFormatter.format(parsed);
}

export const formatTime = (createdAt: string) => {
  const date = parseValidDate(createdAt);
  if (!date) return createdAt;

  return appTimeFormatter.format(date);
};
