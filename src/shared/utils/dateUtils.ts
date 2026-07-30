export function nowISO(): string {
  return new Date().toISOString();
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function isToday(date: string | Date): boolean {
  return isSameDay(date, new Date());
}
