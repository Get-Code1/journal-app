export function dateStringToDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateString(): string {
  return toDateString(new Date());
}

export function shiftDateString(dateStr: string, deltaDays: number): string {
  const d = dateStringToDate(dateStr);
  d.setDate(d.getDate() + deltaDays);
  return toDateString(d);
}

// Monday of the week containing dateStr (ISO week start).
export function mondayOfWeek(dateStr: string): string {
  const d = dateStringToDate(dateStr);
  const day = d.getDay(); // 0 = Sunday .. 6 = Saturday
  const diff = day === 0 ? -6 : 1 - day;
  return shiftDateString(dateStr, diff);
}
