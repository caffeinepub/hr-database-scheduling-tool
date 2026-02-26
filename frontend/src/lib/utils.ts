import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Convert a Date object to a nanosecond timestamp (bigint)
export function dateToNanoseconds(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

// Convert nanoseconds timestamp to Date
export function nanosecondsToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

// Convert date string (YYYY-MM-DD) to nanosecond timestamp
export function dateToTimestamp(dateStr: string): bigint {
  const date = new Date(dateStr + "T00:00:00");
  return dateToNanoseconds(date);
}

// Convert datetime string to nanosecond timestamp
export function dateTimeToTimestamp(dateStr: string, timeStr: string): bigint {
  const date = new Date(`${dateStr}T${timeStr}:00`);
  return dateToNanoseconds(date);
}

// Convert nanosecond timestamp to date input value (YYYY-MM-DD)
export function timestampToDateInput(ns: bigint): string {
  const date = nanosecondsToDate(ns);
  return date.toISOString().split("T")[0];
}

// Convert nanosecond timestamp to time input value (HH:MM)
export function timestampToTimeInput(ns: bigint): string {
  const date = nanosecondsToDate(ns);
  return date.toTimeString().substring(0, 5);
}

// Format date for display
export function formatDate(ns: bigint): string {
  const date = nanosecondsToDate(ns);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Format time for display
export function formatTime(ns: bigint): string {
  const date = nanosecondsToDate(ns);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format date and time for display
export function formatDateTime(ns: bigint): string {
  return `${formatDate(ns)} ${formatTime(ns)}`;
}

// Get week dates starting from Thursday
export function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const day = referenceDate.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu
  // Find the most recent Thursday
  const daysFromThursday = (day - 4 + 7) % 7;
  const thursday = new Date(referenceDate);
  thursday.setDate(referenceDate.getDate() - daysFromThursday);
  thursday.setHours(0, 0, 0, 0);

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(thursday);
    d.setDate(thursday.getDate() + i);
    week.push(d);
  }
  return week;
}

// Get current month string (YYYY-MM)
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Check if a date is expiring soon (within 30 days)
export function isExpiringSoon(ns: bigint): boolean {
  const date = nanosecondsToDate(ns);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

// Check if a date has expired
export function isExpired(ns: bigint): boolean {
  const date = nanosecondsToDate(ns);
  return date < new Date();
}

// Check if two dates are the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Days between two timestamps
export function daysBetween(start: bigint, end: bigint): number {
  const startDate = nanosecondsToDate(start);
  const endDate = nanosecondsToDate(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Add months to a date
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

// Format inventory order status to human-readable label
export function formatOrderStatusLabel(status: string): string {
  switch (status) {
    case "orderRequired":
      return "Order Required";
    case "ordered":
      return "Ordered";
    case "ok":
    default:
      return "OK";
  }
}

// Experience/Building options for stock requests
export const EXPERIENCE_OPTIONS = [
  "Milton General",
  "The Happy Institute",
  "The Dollhouse",
  "Wizard Of Oz",
  "St Georges General",
  "Break The Bank",
  "Marvellous Magic School",
  "Riddled",
  "Hell House",
  "The Don's Revenge",
  "Whodunit",
  "Battle Masters",
  "FEC General",
  "Time Raiders",
  "Laser Quest",
  "Retro Arcade",
  "7 Sins",
  "CSI Disco",
  "CSI Mafia",
  "Karaoke Lounge",
  "Karaoke Disco",
  "Like TV Game Show",
  "Splatter Room",
];

export const INVENTORY_LOCATIONS = ["Bar", "FEC Cafe", "Battle Masters"] as const;
export type InventoryLocation = (typeof INVENTORY_LOCATIONS)[number];
