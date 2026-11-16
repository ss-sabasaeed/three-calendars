/**
 * Desi (Punjabi Bikrami) solar calendar.
 *
 * Each Desi month begins on a "sankranti": the moment the Sun enters the next
 * sidereal zodiac sign (rashi). We compute the Sun's sidereal longitude with a
 * low-precision solar formula (Meeus, "Astronomical Algorithms", ch. 25) and
 * the Lahiri ayanamsa. That is accurate to a few minutes, which is enough to
 * decide on which civil day a month starts.
 *
 * Day-boundary rule: if the sankranti happens before local midnight
 * (Indian Standard Time, UTC+5:30, as used by Drik Panchang) that same day is
 * day 1 of the new month.
 *
 * Bikrami year: changes on 1 Chet (mid-March). Gregorian year + 57 from then
 * until the end of December, + 56 in January to mid-March.
 */

const DAY_MS = 86_400_000;
const IST_OFFSET_MS = 5.5 * 3_600_000;
const DEG = Math.PI / 180;

/** Julian Day from a JS timestamp (ms since Unix epoch, UTC). */
export function julianDay(ms) {
  return ms / DAY_MS + 2440587.5;
}

/** Apparent tropical longitude of the Sun in degrees (Meeus low precision). */
export function sunTropicalLongitude(jd) {
  const T = (jd - 2451545) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  const aberration = -0.00569;
  return normalize(L0 + C + aberration);
}

/** Lahiri ayanamsa in degrees (linear approximation, ~50.29"/year). */
export function lahiriAyanamsa(jd) {
  const T = (jd - 2451545) / 36525;
  return 23.85711 + 1.39688 * T;
}

/** Sidereal longitude of the Sun in degrees, 0 = start of Mesha (Aries). */
export function sunSiderealLongitude(ms) {
  const jd = julianDay(ms);
  return normalize(sunTropicalLongitude(jd) - lahiriAyanamsa(jd));
}

/** Rashi index 0..11 (0 = Mesha) the Sun is in at the given moment. */
export function rashiAt(ms) {
  return Math.floor(sunSiderealLongitude(ms) / 30);
}

/** Timestamp of the end of a civil day (midnight IST). Month is 0-based. */
function endOfDayIST(year, month, day) {
  return Date.UTC(year, month, day + 1) - IST_OFFSET_MS;
}

/**
 * Desi month index used by this app: 0 = Vaisakh ... 10 = Phagan, 11 = Chet.
 * It equals the rashi index (Sun in Mesha = Vaisakh).
 *
 * @param {number} year  Gregorian year
 * @param {number} month Gregorian month, 0-based
 * @param {number} day   Day of month
 * @returns {{day:number, month:number, year:number}}
 */
export function toDesi(year, month, day) {
  const rashi = rashiAt(endOfDayIST(year, month, day));

  // Walk back to the first day of this month (a month is at most 32 days).
  let dayOfMonth = 1;
  while (dayOfMonth < 40 && rashiAt(endOfDayIST(year, month, day - dayOfMonth)) === rashi) {
    dayOfMonth++;
  }

  // Poh (8), Magh (9) and Phagan (10) early in the Gregorian year still belong
  // to the previous Bikrami year; the year turns over on 1 Chet.
  const beforeChet = month <= 3 && (rashi === 8 || rashi === 9 || rashi === 10);
  const bikramiYear = year + (beforeChet ? 56 : 57);

  return { day: dayOfMonth, month: rashi, year: bikramiYear };
}

function normalize(deg) {
  return ((deg % 360) + 360) % 360;
}
