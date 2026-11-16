import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const quotes = JSON.parse(await readFile(new URL('../src/data/quotes.json', import.meta.url), 'utf8'));

test('quotes are non-empty, unique and short enough for two lines', () => {
  assert.ok(quotes.length >= 100);
  assert.equal(new Set(quotes).size, quotes.length, 'duplicate quote');
  for (const q of quotes) {
    assert.ok(q.trim().length > 5, 'empty quote');
    assert.ok(q.length <= 80, `too long for the poster: ${q}`);
  }
});
