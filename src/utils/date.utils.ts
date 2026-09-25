import { endOfMonth, parseDate, startOfMonth, startOfWeek, today, toZoned } from "@internationalized/date";
import type { IDateRange } from "../models/data/analyzer/analyzer.request";

// Calendar-date maths in a shop's timezone. Dates travel as YYYY-MM-DD strings.

export const todayIn = (timezone: string) => today(timezone).toString();

// A Monday–Sunday week or a calendar month, stepped back `offset` periods (0 = current).
export const periodRange = (
  period: "week" | "month",
  offset: number,
  timezone: string,
): IDateRange => {
  const now = today(timezone);

  if (period === "week") {
    const start = startOfWeek(now.add({ weeks: offset }), "en-US", "mon");
    return { from: start.toString(), to: start.add({ days: 6 }).toString() };
  }

  const start = startOfMonth(now.add({ months: offset }));
  return { from: start.toString(), to: endOfMonth(start).toString() };
};

// The instant a shop-local day starts, for filtering timestamps by date.
export const dayStartInstant = (date: string, timezone: string) =>
  toZoned(parseDate(date), timezone).toAbsoluteString();

// The instant after a shop-local day ends: the next day's start, excluded.
export const dayEndInstant = (date: string, timezone: string) =>
  toZoned(parseDate(date).add({ days: 1 }), timezone).toAbsoluteString();

// Every IANA zone the browser knows, plus the saved one if the browser lacks it.
export const timezoneOptions = (current: string) => {
  const zones = Intl.supportedValuesOf("timeZone");
  const all = current && !zones.includes(current) ? [current, ...zones] : zones;
  return all.map((zone) => ({ value: zone, label: zone.replace(/_/g, " ") }));
};
