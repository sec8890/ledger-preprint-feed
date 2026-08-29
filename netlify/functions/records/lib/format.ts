export function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

export function shortDate(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(dt);
}

/** "Smith, John A." or "Smith, J." -> "J. Smith" */
export function initialLast(name: string): string {
  const [last, first] = name.split(',').map((p) => p.trim());
  if (!first) return last ?? name;
  const initial = first.trim()[0];
  return initial ? `${initial}. ${last}` : last;
}
