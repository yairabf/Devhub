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

export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
