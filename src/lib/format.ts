export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getTypeSlug(name: string): string {
  return name.toLowerCase() + "s";
}

/** Formats an ISO timestamp as YYYY-MM-DD (UTC), or "" when unparseable. */
export function formatIsoDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
