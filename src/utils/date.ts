import {
  ONE_DAY_IN_MS,
  ONE_WEEK_IN_MS,
  ONE_YEAR_IN_MS,
  VIETNAM_LOCALE,
  VIETNAM_TIME_ZONE,
} from "@/config/constant";

const vietnamTimeFormatter = new Intl.DateTimeFormat(VIETNAM_LOCALE, {
  timeZone: VIETNAM_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const vietnamDateTimeFormatter = new Intl.DateTimeFormat(VIETNAM_LOCALE, {
  timeZone: VIETNAM_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const vietnamWeekdayFormatter = new Intl.DateTimeFormat(VIETNAM_LOCALE, {
  timeZone: VIETNAM_TIME_ZONE,
  weekday: "long",
});

const vietnamShortDateFormatter = new Intl.DateTimeFormat(VIETNAM_LOCALE, {
  timeZone: VIETNAM_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
});

const vietnamShortYearDateFormatter = new Intl.DateTimeFormat(VIETNAM_LOCALE, {
  timeZone: VIETNAM_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

const vietnamMessageDateFormatter = new Intl.DateTimeFormat(VIETNAM_LOCALE, {
  timeZone: VIETNAM_TIME_ZONE,
  day: "2-digit",
  month: "short",
});

const vietnamMessageDateWithYearFormatter = new Intl.DateTimeFormat(
  VIETNAM_LOCALE,
  {
    timeZone: VIETNAM_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
);

const vietnamYearFormatter = new Intl.DateTimeFormat(VIETNAM_LOCALE, {
  timeZone: VIETNAM_TIME_ZONE,
  year: "numeric",
});

function parseValidDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTimestamp(timestamp: string) {
  const messageDate = parseValidDate(timestamp);

  if (!messageDate) return timestamp;

  const now = new Date();
  const diffInMs = now.getTime() - messageDate.getTime();

  if (diffInMs <= ONE_DAY_IN_MS)
    return vietnamTimeFormatter.format(messageDate);

  if (diffInMs <= ONE_WEEK_IN_MS)
    return vietnamWeekdayFormatter.format(messageDate);

  if (diffInMs <= ONE_YEAR_IN_MS)
    return vietnamShortDateFormatter.format(messageDate);

  return vietnamShortYearDateFormatter.format(messageDate);
}

export function formatMessageDate(value: string) {
  const date = parseValidDate(value);
  if (!date) return value;

  const currentYear = vietnamYearFormatter.format(new Date());
  const messageYear = vietnamYearFormatter.format(date);

  if (messageYear === currentYear)
    return vietnamMessageDateFormatter.format(date);

  return vietnamMessageDateWithYearFormatter.format(date);
}

export function formatDateTime(value?: string) {
  if (!value) return "-";

  const parsed = parseValidDate(value);
  if (!parsed) return value;

  return vietnamDateTimeFormatter.format(parsed);
}

export const formatTime = (createdAt: string) => {
  const date = parseValidDate(createdAt);
  if (!date) return createdAt;

  return vietnamTimeFormatter.format(date);
};
