// Formatos comunes de fecha (Chile): dd/MM/yyyy y relativeTime.

const LOCALE = 'es-CL' as const;
const TIME_ZONE = 'America/Santiago' as const;

export type DateInput = Date | string | number;
type Unit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

function toDate(d: unknown): Date | null {
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d === 'string' || typeof d === 'number') {const parsed = new Date(d); return isNaN(parsed.getTime()) ? null : parsed;} return null;
}

function partsRecord(date: Date): Record<Intl.DateTimeFormatPartTypes, string> { const parts = new Intl.DateTimeFormat(LOCALE, {timeZone: TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric'}).formatToParts(date); const out: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
    for (const p of parts) out[p.type] = p.value; out.day ??= ''; out.month ??= ''; out.year ??= ''; return out as Record<Intl.DateTimeFormatPartTypes, string>;
}


/** dd/MM/yyyy (30/10/2025) */

export function formatDate_ddMMyyyy(dateLike: DateInput, fallback = ''): string {
  const d = toDate(dateLike);
  if (!d) return fallback;
  const p = partsRecord(d);
  return `${p.day}/${p.month}/${p.year}`;
}


/** Relative time ("hace X días") */ 

export function relativeTime(
  fromDateLike: DateInput,
  toDateLike: DateInput = new Date(),
  fallback = ''
): string {
  const from = toDate(fromDateLike);
  const to = toDate(toDateLike);
  if (!from || !to) return fallback;

  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'always' });

  const MS_PER_UNIT: Record<Unit, number> = {
    year:   365 * 24 * 60 * 60 * 1000,
    month:  30  * 24 * 60 * 60 * 1000,
    week:   7   * 24 * 60 * 60 * 1000,
    day:    24  * 60 * 60 * 1000,
    hour:   60  * 60 * 1000,
    minute: 60  * 1000,
    second: 1000
  };

  const diffMs = from.getTime() - to.getTime();
  const order: Unit[] = ['year','month','week','day','hour','minute','second'];
  for (const unit of order) {const value = diffMs / MS_PER_UNIT[unit]; if (Math.abs(value) >= 1 || unit === 'second') {return rtf.format(Math.round(value), unit as Intl.RelativeTimeFormatUnit);} } return fallback;
}
