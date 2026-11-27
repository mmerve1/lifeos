import { Language } from '../i18n';

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  return next;
}

export function getStartOfWeek(date: Date): Date {
  // Monday = 0 ... Sunday = 6
  const day = (date.getDay() + 6) % 7;
  return addDays(date, -day);
}

export function getWeekDates(anchor: Date): Date[] {
  const start = getStartOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getMonthGridDates(year: number, monthIndex: number): { date: Date; inMonth: boolean }[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const gridStart = addDays(firstOfMonth, -startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = addDays(gridStart, i);
    return {
      date: d,
      inMonth: d.getMonth() === monthIndex,
    };
  });
}

export function formatMonthYear(date: Date, language: Language): string {
  try {
    return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  }
}

export function formatFullDate(date: Date, language: Language): string {
  try {
    return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
  } catch {
    return toIsoDate(date);
  }
}

export function getShortWeekdays(language: Language): string[] {
  return language === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

export function getSingleLetterWeekdays(language: Language): string[] {
  return language === 'tr'
    ? ['P', 'S', 'Ç', 'P', 'C', 'C', 'P']
    : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
}

export function parseHour(dueTime?: string): number | null {
  if (!dueTime) return null;
  const match = dueTime.match(/^(\d{1,2})[:.]/);
  if (!match) return null;
  const h = Number(match[1]);
  return Number.isFinite(h) && h >= 0 && h <= 23 ? h : null;
}

export const TIMELINE_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
