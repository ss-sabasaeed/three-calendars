/** Colours and font families used on the poster. */

export const THEME = {
  cream: '#fbf3dc',
  gold: '#c9a54a',
  green: '#1e5c35',
  greenLight: '#23703f',
  greenDark: '#164a29',
  navy: '#1a2a6c',
  ink: '#1f2937',
  quote: '#1c5a32',
  link: '#2457c5',
};

export const COLUMN_THEMES = {
  desi: { head: '#9b1c1c', body: '#fdeee8', arch: '#f6c7b3', ink: '#9b1c1c', border: '#b33a3a' },
  gregorian: { head: '#1b3a82', body: '#eaf0fa', arch: '#c8d9f1', ink: '#1b3a82', border: '#3355a0' },
  hijri: { head: '#1c6b3a', body: '#e8f4ec', arch: '#c6e5cf', ink: '#1c6b3a', border: '#2f8150' },
};

/** Font families registered in src/fonts.css (built into the page). */
export const FONT = {
  urdu: 'NotoNaskh', // Noto Naskh Arabic: Urdu text
  quran: 'AmiriQuran', // Amiri Quran: Bismillah
  display: 'Amiri, NotoNaskh', // big serif date
  latin: 'NotoSans', // English text and numbers
};

/** Every face the poster uses, so the app can wait for them before drawing. */
export const FONT_FACES = [
  `400 20px ${FONT.urdu}`,
  `500 20px ${FONT.urdu}`,
  `700 20px ${FONT.urdu}`,
  `400 20px ${FONT.quran}`,
  '700 20px Amiri',
  `400 20px ${FONT.latin}`,
  `700 20px ${FONT.latin}`,
  `800 20px ${FONT.latin}`,
];
