/**
 * Keeps the last two words on one line so a single word is not left alone (widow).
 * Use for short headlines; long body copy should rely on `text-wrap: pretty` in CSS.
 */
export function noWidow(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^(.*)\s+(\S+)\s+(\S+)$/);
  if (!match) return trimmed;
  const [, start, secondLast, last] = match;
  return `${start} ${secondLast}\u00A0${last}`;
}
