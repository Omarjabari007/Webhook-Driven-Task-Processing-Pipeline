export function formatCiv(civ: string): string {
  return civ
    .replaceAll("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}