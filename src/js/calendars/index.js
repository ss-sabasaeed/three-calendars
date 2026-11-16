import { toDesi } from './desi.js';
import { toHijri } from './hijri.js';

/**
 * All the information the poster needs for one civil date.
 *
 * @param {number} year  Gregorian year
 * @param {number} month Gregorian month, 0-based
 * @param {number} day   Day of month
 * @param {{hijriAdjust?: number}} [options]
 */
export function datesFor(year, month, day, { hijriAdjust = 0 } = {}) {
  const utc = Date.UTC(year, month, day);
  const d = new Date(utc);
  return {
    weekday: d.getUTCDay(),
    gregorian: {
      day: d.getUTCDate(),
      month: d.getUTCMonth(),
      year: d.getUTCFullYear(),
      dayOfYear: Math.round((utc - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86_400_000) + 1,
    },
    desi: toDesi(year, month, day),
    hijri: toHijri(year, month, day, hijriAdjust),
  };
}

export { toDesi, toHijri };
