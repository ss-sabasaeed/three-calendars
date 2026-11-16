/**
 * User settings, remembered in localStorage when the browser allows it.
 */
export const DEFAULTS = Object.freeze({
  hijriAdjust: -1, // Pakistan usually sights the moon a day after Saudi Arabia
  name: 'منجانب محمد سعید کمبوہ رتنپال',
  message: 'اللہ کے وقت پر بھروسہ رکھیں۔ سب کچھ اسی کے اختیار میں ہے۔',
});

const PREFIX = 'tk_';

function read(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v === null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable: setting lasts for this visit only */
  }
}

export function loadSettings() {
  return {
    hijriAdjust: read('hadj', DEFAULTS.hijriAdjust),
    name: read('name', DEFAULTS.name),
    message: read('quote', DEFAULTS.message),
  };
}

export function saveSettings(s) {
  write('hadj', s.hijriAdjust);
  write('name', s.name);
  write('quote', s.message);
}
