import QUOTES from '../data/quotes.json';

/**
 * Quote for a date: cycles through the list one per day.
 * `offset` lets the user step to the next/previous quote for that day.
 */
export function quoteFor(year, month, day, offset = 0) {
  const dayNumber = Math.floor(Date.UTC(year, month, day) / 86_400_000);
  const n = QUOTES.length;
  return QUOTES[(((dayNumber + offset) % n) + n) % n];
}

export const QUOTE_COUNT = QUOTES.length;
