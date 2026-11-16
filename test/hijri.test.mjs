import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toHijri, tabular, hasUmmAlQura } from '../src/js/calendars/hijri.js';
import { HIJRI_MONTHS } from '../src/js/calendars/names.js';

const hijri = (y, m, d, adj = 0) => {
  const r = toHijri(y, m - 1, d, adj);
  return `${r.day} ${HIJRI_MONTHS.en[r.month]} ${r.year}`;
};

test('Umm al-Qura calendar is available in this runtime', () => {
  assert.ok(hasUmmAlQura);
});

test('matches the original hand-made poster with the Pakistan adjustment (-1)', () => {
  assert.equal(hijri(2026, 11, 8, -1), '27 Jumada al-Awwal 1448');
});

test('without adjustment it follows Umm al-Qura', () => {
  assert.equal(hijri(2026, 11, 8), '28 Jumada al-Awwal 1448');
});

test('adjustment shifts the date by whole days', () => {
  const base = toHijri(2026, 10, 8, 0);
  const plus = toHijri(2026, 10, 8, 1);
  assert.equal(plus.day, base.day + 1);
});

test('arithmetic fallback stays within a day or two of Umm al-Qura', () => {
  for (let i = 0; i < 400; i += 7) {
    const d = new Date(Date.UTC(2026, 0, 1 + i, 12));
    const a = tabular(d);
    const b = toHijri(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const toDays = (h) => h.year * 354.367 + h.month * 29.53 + h.day;
    assert.ok(Math.abs(toDays(a) - toDays(b)) <= 2, `too far apart on ${d.toISOString()}`);
  }
});
