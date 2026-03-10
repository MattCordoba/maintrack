import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 1) return "1 day overdue";
    return `${absDays} days overdue`;
  }
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return formatDate(d);
}

export function getDaysUntilDue(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diffTime = d.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getTaskStatus(
  dueDate: Date | string,
  dueSoonWindow: number = 7
): "overdue" | "due_soon" | "scheduled" {
  const days = getDaysUntilDue(dueDate);
  if (days < 0) return "overdue";
  if (days <= dueSoonWindow) return "due_soon";
  return "scheduled";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "overdue":
      return "text-overdue";
    case "due_soon":
      return "text-due-soon";
    case "scheduled":
      return "text-scheduled";
    case "one_time":
      return "text-one-time";
    case "completed":
      return "text-completed";
    default:
      return "text-muted-foreground";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case "overdue":
      return "bg-overdue";
    case "due_soon":
      return "bg-due-soon";
    case "scheduled":
      return "bg-scheduled";
    case "one_time":
      return "bg-one-time";
    case "completed":
      return "bg-completed";
    default:
      return "bg-muted";
  }
}

export function calculateNextDueDate(
  lastCompleted: Date,
  intervalValue: number,
  intervalUnit: "day" | "week" | "month" | "year"
): Date {
  const next = new Date(lastCompleted);
  switch (intervalUnit) {
    case "day":
      next.setDate(next.getDate() + intervalValue);
      break;
    case "week":
      next.setDate(next.getDate() + intervalValue * 7);
      break;
    case "month":
      next.setMonth(next.getMonth() + intervalValue);
      break;
    case "year":
      next.setFullYear(next.getFullYear() + intervalValue);
      break;
  }
  return next;
}

export function formatMeterValue(value: number, unit: string): string {
  return `${value.toLocaleString()} ${unit}`;
}
