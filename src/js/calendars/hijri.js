/**
 * Hijri (Islamic lunar) calendar.
 *
 * Uses the Umm al-Qura calendar built into the browser (Intl API). In Pakistan
 * the month often starts a day later because it depends on local moon
 * sighting, so callers pass an adjustment in days (the app defaults to -1).
 *
 * If the browser has no Umm al-Qura support, falls back to the arithmetic
 * (tabular) Islamic calendar.
 */

const umalqura = (() => {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
    // Some engines silently fall back to Gregorian; make sure it really is Hijri.
    const probe = Object.fromEntries(fmt.formatToParts(new Date(Date.UTC(2026, 10, 8))).map((p) => [p.type, p.value]));
    return parseInt(probe.year, 10) > 1400 ? fmt : null;
  } catch {
    return null;
  }
})();

/**
 * @param {number} year  Gregorian year
 * @param {number} month Gregorian month, 0-based
 * @param {number} day   Day of month
 * @param {number} [adjustDays=0] Shift for local moon sighting (e.g. -1 for Pakistan)
 * @returns {{day:number, month:number, year:number}} month is 0-based (0 = Muharram)
 */
export function toHijri(year, month, day, adjustDays = 0) {
  const date = new Date(Date.UTC(year, month, day + adjustDays, 12));
  return umalqura ? fromIntl(date) : tabular(date);
}

function fromIntl(date) {
  const p = Object.fromEntries(umalqura.formatToParts(date).map((x) => [x.type, x.value]));
  return { day: +p.day, month: +p.month - 1, year: parseInt(p.year, 10) };
}

/** Arithmetic Islamic calendar (Kuwaiti algorithm). */
export function tabular(date) {
  const jdn = Math.floor(date.getTime() / 86_400_000 + 2440587.5 + 0.5);
  const l0 = jdn - 1948440 + 10632;
  const n = Math.floor((l0 - 1) / 10631);
  const l = l0 - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  const l2 =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * l2) / 709);
  const d = l2 - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { day: d, month: m - 1, year: y };
}

export const hasUmmAlQura = umalqura !== null;
