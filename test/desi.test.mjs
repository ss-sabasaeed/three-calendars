import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toDesi } from '../src/js/calendars/desi.js';
import { DESI_MONTHS } from '../src/js/calendars/names.js';

/** Format a Desi date as "23 Katak 2083" for readable assertions. */
const desi = (y, m, d) => {
  const r = toDesi(y, m - 1, d);
  return `${r.day} ${DESI_MONTHS.en[r.month]} ${r.year}`;
};

test('matches the original hand-made poster (8 Nov 2026)', () => {
  assert.equal(desi(2026, 11, 8), '23 Katak 2083');
});

test('Vaisakhi is 1 Vaisakh', () => {
  assert.equal(desi(2026, 4, 14), '1 Vaisakh 2083');
  assert.equal(desi(2027, 4, 14), '1 Vaisakh 2084');
});

test('Lohri is the last day of Poh and Maghi is 1 Magh', () => {
  assert.equal(desi(2026, 1, 13), '29 Poh 2082');
  assert.equal(desi(2026, 1, 14), '1 Magh 2082');
});

test('month boundaries in November 2026', () => {
  assert.equal(desi(2026, 10, 17), '1 Katak 2083');
  assert.equal(desi(2026, 11, 15), '30 Katak 2083');
  assert.equal(desi(2026, 11, 16), '1 Maghar 2083');
});

test('Bikrami year changes on 1 Chet, not on 1 January', () => {
  assert.equal(desi(2026, 3, 14), '30 Phagan 2082');
  assert.equal(desi(2026, 3, 15), '1 Chet 2083');
  assert.equal(desi(2026, 12, 31).endsWith('2083'), true);
  assert.equal(desi(2027, 1, 1).endsWith('2083'), true);
});

test('every day of several years gets a valid date that advances by one', () => {
  let prev = toDesi(2024, 11, 31);
  for (let i = 1; i <= 365 * 6; i++) {
    const d = new Date(Date.UTC(2025, 0, i));
    const cur = toDesi(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    assert.ok(cur.day >= 1 && cur.day <= 32, `day out of range on ${d.toISOString()}`);
    if (cur.day === 1) {
      assert.equal(cur.month, (prev.month + 1) % 12, `month did not advance on ${d.toISOString()}`);
      assert.ok(prev.day >= 29, `short month before ${d.toISOString()}`);
    } else {
      assert.equal(cur.day, prev.day + 1);
      assert.equal(cur.month, prev.month);
    }
    prev = cur;
  }
});
