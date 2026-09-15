/**
 * Date utilities to prevent timezone shift issues across client & server.
 * Standardizes formatting to YYYY-MM-DD in local time without UTC offset bugs.
 */

export function formatLocalDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "";
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Noon local time to safely avoid any midnight timezone shifts
}

export function getTodayLocalDateStr(): string {
  return formatLocalDate(new Date());
}
