import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDeterministicDate(unixTimestamp: number, fullMonth = true): string {
  const d = new Date(unixTimestamp * 1000);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = fullMonth ? FULL_MONTHS[d.getUTCMonth()] : MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

export function formatDeterministicMonthYear(unixTimestamp: number): string {
  const d = new Date(unixTimestamp * 1000);
  const month = FULL_MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${month} ${year}`;
}

export function formatDeterministicDateTime(unixTimestamp: number): string {
  const d = new Date(unixTimestamp * 1000);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes} UTC`;
}
