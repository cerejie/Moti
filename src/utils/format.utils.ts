/** Shared display formatters: money, dates, phone numbers. */

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

/** Format a number as Philippine pesos, e.g. ₱1,749.70. */
export function formatPeso(amount: number): string {
  return pesoFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/**
 * Format an API date string (YYYY-MM-DD or ISO timestamp) as a long date,
 * e.g. "October 20, 2025". Returns an em dash for missing/invalid values.
 */
export function formatLongDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/**
 * Format an API date string (YYYY-MM-DD or ISO timestamp) as a short date,
 * e.g. "Oct 17, 2025".
 */
export function formatShortDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : shortDateFormatter.format(date);
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Format an API timestamp as "07/03/2026 13:52" — the compact date + time used
 * in activity timelines. Returns an em dash for missing/invalid values.
 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date).replace(",", "");
}

// Calendar dates carry no time, so they are formatted as UTC to keep the day as written.
const dateRangeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

// Two calendar dates (YYYY-MM-DD) as one range: "Sep 22 – 28, 2026".
export function formatDateRange(from: string, to: string): string {
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "—";
  return dateRangeFormatter.formatRange(start, end);
}

const countFormatter = new Intl.NumberFormat("en-PH");

// A whole-number total with thousands separators: 12,480.
export function formatCount(value: number): string {
  return countFormatter.format(value);
}

// How many items use a masterfile entry: "1 item", "12 items".
export function formatItemCount(value: number): string {
  return value === 1 ? "1 item" : `${formatCount(value)} items`;
}

// A nav or bell badge: the count, capped at 99+.
export function formatBadgeCount(value: number): string {
  return value > 99 ? "99+" : String(value);
}

// A ledger quantity with its direction: +5 or −3 (a true minus sign).
export function formatSignedQuantity(quantity: number): string {
  return quantity > 0 ? `+${quantity}` : `−${Math.abs(quantity)}`;
}

// The ten digits a PH mobile number has after +63 / 0, always starting with 9.
// Accepts a stored 09…, a pasted +639…, or whatever is being typed.
function phMobileDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.replace(/^[^9]+/, "").slice(0, 10);
}

// What the field shows after its +63 addon: 927 408 3654.
export function formatPhMobileInput(value: string): string {
  const digits = phMobileDigits(value);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)]
    .filter(Boolean)
    .join(" ");
}

// What the form stores and the API receives: 09274083654.
export function toPhMobileValue(input: string): string {
  const digits = phMobileDigits(input);
  return digits === "" ? "" : `0${digits}`;
}
