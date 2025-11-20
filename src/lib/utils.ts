export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateRange(
  start?: string | Date | null,
  end?: string | Date | null,
): string {
  if (!start && !end) return "No schedule";
  if (start && !end) return formatDateTime(start);
  if (!start && end) return formatDateTime(end);
  return `${formatDateTime(start)} • ${formatDateTime(end)}`;
}
