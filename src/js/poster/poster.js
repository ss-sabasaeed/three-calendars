/**
 * Draws the full "تین کیلنڈر ایک نظر میں" poster onto a canvas.
 * Layout follows the original hand-made status image (1066 × 1600 units).
 */
import { createPainter } from './painter.js';
import { THEME, COLUMN_THEMES, FONT } from './theme.js';
import { drawMosque } from './mosque.js';
import { WEEKDAYS, GREGORIAN_MONTHS, HIJRI_MONTHS, DESI_MONTHS } from '../calendars/names.js';

export const POSTER_WIDTH = 1066;
export const POSTER_HEIGHT = 1600;

const BISMILLAH = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';
const pad2 = (n) => String(n).padStart(2, '0');

/**
 * @param {CanvasRenderingContext2D} ctx  context already scaled to poster units
 * @param {object} data
 * @param {ReturnType<import('../calendars/index.js').datesFor>} data.dates
 * @param {string} data.quote    quote of the day
 * @param {string} data.name     footer text
 * @param {string} data.message  top-left message
 */
export function drawPoster(ctx, { dates, quote, name, message }) {
  const p = createPainter(ctx);
  const { weekday, gregorian: g, desi, hijri } = dates;

  drawBackground(p);
  drawHeader(p, message);
  drawDateStrip(p, g, weekday);

  drawColumn(p, 18, COLUMN_THEMES.desi, {
    title: ['دیسی مہینہ (بکرمی)', 'Desi Month (Bikrami)'],
    month: [DESI_MONTHS.ur[desi.month], DESI_MONTHS.en[desi.month]],
    day: desi.day,
    weekday,
    year: desi.year,
    yearLabel: 'بکرمی سن',
    note: 'دیسی مہینے کی تاریخ ہندو روایات و حساب کے مطابق ہوتی ہے',
  });
  drawColumn(p, 368, COLUMN_THEMES.gregorian, {
    title: ['عیسوی مہینہ', 'Gregorian Month'],
    month: [GREGORIAN_MONTHS.ur[g.month], GREGORIAN_MONTHS.en[g.month]],
    day: g.day,
    weekday,
    year: g.year,
    yearLabel: 'عیسوی سن',
    note: `سال کا ${g.dayOfYear}واں دن`,
    noteEn: `Day of Year: ${g.dayOfYear}`,
  });
  drawColumn(p, 718, COLUMN_THEMES.hijri, {
    title: ['قمری مہینہ', 'Qamri Month'],
    month: [HIJRI_MONTHS.ur[hijri.month], HIJRI_MONTHS.en[hijri.month]],
    day: hijri.day,
    weekday,
    year: hijri.year,
    yearLabel: 'ہجری سن',
    note: 'چاند کی رویت کے مطابق ایک دن کا فرق ممکن ہے',
  });

  drawQuote(p, quote);
  drawReferences(p);
  drawFooter(p, name);
}

// ---------------------------------------------------------------- sections

function drawBackground({ ctx }) {
  ctx.fillStyle = THEME.cream;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  // Faint diamond-and-circle pattern.
  ctx.save();
  ctx.strokeStyle = 'rgba(176,140,60,0.10)';
  ctx.lineWidth = 1;
  const s = 44;
  for (let y = -s; y < POSTER_HEIGHT + s; y += s) {
    for (let x = -s; x < POSTER_WIDTH + s; x += s) {
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y);
      ctx.lineTo(x + s, y + s / 2);
      ctx.lineTo(x + s / 2, y + s);
      ctx.lineTo(x, y + s / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Soft light in the middle.
  const glow = ctx.createRadialGradient(533, 800, 200, 533, 800, 900);
  glow.addColorStop(0, 'rgba(255,252,240,0.55)');
  glow.addColorStop(1, 'rgba(255,252,240,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  // Double gold frame.
  ctx.strokeStyle = THEME.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(7, 7, POSTER_WIDTH - 14, POSTER_HEIGHT - 14);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(15, 15, POSTER_WIDTH - 30, POSTER_HEIGHT - 30);
}

function drawHeader(p, message) {
  const { ctx } = p;

  // Top-left message box (dashed gold border).
  ctx.save();
  ctx.setLineDash([5, 4]);
  p.box(32, 32, 245, 213, 10, { fill: 'rgba(255,250,235,0.9)', stroke: THEME.gold });
  ctx.restore();
  p.box(38, 38, 233, 201, 7, { stroke: 'rgba(201,165,74,0.5)', lineWidth: 1 });

  let size = 26;
  let lines;
  for (; size >= 16; size--) {
    lines = p.wrap(message, `500 ${size}px ${FONT.urdu}`, 205);
    if (lines.length * size * 1.75 <= 190) break;
  }
  const lh = size * 1.75;
  const y0 = 138 - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => p.text(l, 155, y0 + i * lh, `500 ${size}px ${FONT.urdu}`, THEME.ink));

  p.text(BISMILLAH, 533, 54, `400 31px ${FONT.quran}`, '#14241a');

  // Ribbon banner.
  const bx = 283;
  const by = 76;
  const bw = 502;
  const bh = 88;
  const tip = 22;
  const ribbon = (o, fill) => {
    ctx.beginPath();
    ctx.moveTo(bx + tip - o, by - o);
    ctx.lineTo(bx + bw - tip + o, by - o);
    ctx.lineTo(bx + bw + o * 1.3, by + bh / 2);
    ctx.lineTo(bx + bw - tip + o, by + bh + o);
    ctx.lineTo(bx + tip - o, by + bh + o);
    ctx.lineTo(bx - o * 1.3, by + bh / 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };
  ribbon(4, THEME.gold);
  ribbon(0, p.vgrad(by, by + bh, THEME.greenLight, THEME.greenDark));
  p.text('تین کیلنڈر ایک نظر میں', 533, by + bh / 2 - 2, `700 46px ${FONT.urdu}`, '#fff');
  p.text('دنیا کے تین مختلف کیلنڈرز – ایک ہی تاریخ', 533, 191, `500 23px ${FONT.urdu}`, '#2b2b2b');
}

function greenPill(p, x, y, w, h) {
  p.shadowBox(x, y, w, h, h / 2, { fill: p.vgrad(y, y + h, THEME.greenLight, THEME.greenDark), shadow: 'rgba(0,0,0,0.25)', blur: 6 });
  p.box(x, y, w, h, h / 2, { stroke: THEME.gold, lineWidth: 2.5 });
}

function drawDateStrip(p, g, weekday) {
  p.shadowBox(52, 265, 962, 163, 42, { fill: '#fffaea', shadow: 'rgba(120,90,20,0.18)', blur: 10 });
  p.box(52, 265, 962, 163, 42, { stroke: THEME.gold, lineWidth: 3 });
  p.box(62, 275, 942, 143, 34, { stroke: 'rgba(201,165,74,0.55)', lineWidth: 1.2 });

  // Left pill: weekday in Urdu + English.
  greenPill(p, 98, 305, 160, 92);
  p.text(WEEKDAYS.ur[weekday], 178, 338, `700 36px ${FONT.urdu}`, '#fff');
  p.text(WEEKDAYS.en[weekday], 178, 371, `700 23px ${FONT.latin}`, '#fff', { dir: 'ltr' });

  // Right pill: "بروز" + weekday.
  greenPill(p, 808, 305, 160, 92);
  p.text('بروز', 888, 331, `500 22px ${FONT.urdu}`, '#fff');
  p.text(WEEKDAYS.ur[weekday], 888, 368, `700 38px ${FONT.urdu}`, '#fff');

  // Big date, e.g. "08 نومبر 2026", and the English line under it.
  const big = `${pad2(g.day)} ${GREGORIAN_MONTHS.ur[g.month]} ${g.year}`;
  const size = p.fitSize(big, '700', FONT.display, 86, 500);
  p.text(big, 533, 328, `700 ${size}px ${FONT.display}`, THEME.navy);
  p.text(`${pad2(g.day)} ${GREGORIAN_MONTHS.en[g.month]} ${g.year}`, 533, 403, `700 27px ${FONT.latin}`, THEME.navy, { dir: 'ltr' });
}

function drawColumn(p, x, theme, c) {
  const { ctx } = p;
  const y = 452;
  const w = 330;
  const h = 713;
  const inset = 13;
  const iw = w - 2 * inset;
  const ix = x + inset;
  const cx = x + w / 2;
  const ltr = { dir: 'ltr' };

  // Card, coloured header band, border.
  p.shadowBox(x, y, w, h, 16, { fill: theme.body });
  p.roundRect(x, y, w, 90, [16, 16, 0, 0]);
  ctx.fillStyle = theme.head;
  ctx.fill();
  p.box(x, y, w, h, 16, { stroke: theme.border, lineWidth: 2.5 });
  p.text(c.title[0], cx, y + 33, `700 28px ${FONT.urdu}`, '#fff');
  p.text(c.title[1], cx, y + 68, `700 21px ${FONT.latin}`, '#fff', ltr);

  // Arch with month name.
  const ay = y + 103;
  const ah = 135;
  ctx.beginPath();
  ctx.moveTo(ix, ay + ah);
  ctx.lineTo(ix, ay + ah * 0.62);
  ctx.bezierCurveTo(ix, ay - ah * 0.12, ix + iw, ay - ah * 0.12, ix + iw, ay + ah * 0.62);
  ctx.lineTo(ix + iw, ay + ah);
  ctx.closePath();
  ctx.fillStyle = theme.arch;
  ctx.fill();
  const ms = p.fitSize(c.month[0], '700', FONT.urdu, 54, iw - 24);
  p.text(c.month[0], cx, ay + 56, `700 ${ms}px ${FONT.urdu}`, theme.ink);
  const es = p.fitSize(c.month[1], '700', FONT.latin, 30, iw - 12, 'ltr');
  p.text(c.month[1], cx, ay + 106, `700 ${es}px ${FONT.latin}`, theme.ink, ltr);

  const row = (top, height) =>
    p.box(ix, top, iw, height, 8, { fill: 'rgba(255,255,255,0.85)', stroke: 'rgba(0,0,0,0.08)', lineWidth: 1.2 });
  const divider = (dx, top, bottom) => {
    ctx.strokeStyle = 'rgba(0,0,0,0.09)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ix + dx, top);
    ctx.lineTo(ix + dx, bottom);
    ctx.stroke();
  };

  // Date row.
  let ry = y + 246;
  row(ry, 130);
  divider(181, ry + 6, ry + 124);
  p.text(pad2(c.day), ix + 91, ry + 68, `800 92px ${FONT.latin}`, theme.ink, ltr);
  p.text('تاریخ', ix + 243, ry + 48, `500 28px ${FONT.urdu}`, theme.ink);
  p.text('Date', ix + 243, ry + 86, `700 24px ${FONT.latin}`, theme.ink, ltr);

  // Weekday row.
  ry += 138;
  row(ry, 89);
  p.text(WEEKDAYS.ur[c.weekday], cx, ry + 28, `500 32px ${FONT.urdu}`, theme.ink);
  p.text(WEEKDAYS.en[c.weekday], cx, ry + 66, `700 27px ${FONT.latin}`, theme.ink, ltr);

  // Year row.
  ry += 97;
  row(ry, 97);
  divider(150, ry + 6, ry + 91);
  p.text(String(c.year), ix + 75, ry + 51, `800 54px ${FONT.latin}`, theme.ink, ltr);
  p.text(c.yearLabel, ix + 222, ry + 35, `500 25px ${FONT.urdu}`, theme.ink);
  p.text('Year', ix + 222, ry + 68, `700 21px ${FONT.latin}`, theme.ink, ltr);

  // Note row.
  ry += 105;
  row(ry, 120);
  if (c.noteEn) {
    p.text(c.note, cx, ry + 44, `500 23px ${FONT.urdu}`, '#222');
    p.text(c.noteEn, cx, ry + 80, `700 23px ${FONT.latin}`, '#222', ltr);
  } else {
    let size = 22;
    let lines;
    for (; size >= 16; size--) {
      lines = p.wrap(c.note, `500 ${size}px ${FONT.urdu}`, iw - 24);
      if (lines.length * size * 1.7 <= 112) break;
    }
    const lh = size * 1.7;
    const y0 = ry + 60 - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => p.text(l, cx, y0 + i * lh, `500 ${size}px ${FONT.urdu}`, '#222'));
  }
}

function drawQuote(p, quote) {
  const bx = 44;
  const by = 1172;
  const bw = 978;
  const bh = 154;
  p.shadowBox(bx, by, bw, bh, 14, { fill: '#fffcf1', stroke: THEME.gold, lineWidth: 2.5, shadow: 'rgba(120,90,20,0.15)' });
  drawMosque(p.ctx, 770, by + bh - 14, 0.98, THEME.green);

  const cx = 410;
  const maxW = 640;
  const marks = 'rgba(201,165,74,0.75)';
  p.text('❞', cx + maxW / 2 + 22, by + 40, `700 46px ${FONT.latin}`, marks, { dir: 'ltr' });
  p.text('❝', cx - maxW / 2 - 22, by + bh - 34, `700 46px ${FONT.latin}`, marks, { dir: 'ltr' });

  // Largest size at which the quote fits on one or two lines.
  let size = 38;
  let lines;
  for (; size >= 20; size--) {
    const font = `700 ${size}px ${FONT.urdu}`;
    lines = p.width(quote, font) <= maxW ? [quote] : p.splitInTwo(quote, font);
    if (lines.every((l) => p.width(l, font) <= maxW) && lines.length * size * 1.7 <= bh - 30) break;
  }
  const lh = size * 1.7;
  const y0 = by + bh / 2 - ((lines.length - 1) * lh) / 2 + 2;
  lines.forEach((l, i) => p.text(l, cx, y0 + i * lh, `700 ${size}px ${FONT.urdu}`, THEME.quote));
}

const REFERENCES = [
  {
    right: 1022,
    left: 692,
    heading: 'بکرمی / دیسی تاریخ کے لیے:',
    items: [
      ['Drik Panchang (Hindi/English)', 'https://www.drikpanchang.com'],
      ['Hindu Calendar (India)', 'https://www.hinducalendar.net'],
    ],
  },
  {
    right: 728,
    left: 398,
    heading: 'عیسوی تاریخ کے لیے:',
    items: [
      ['Time and Date', 'https://www.timeanddate.com'],
      ['Calendar-365', 'https://www.calendar-365.com'],
    ],
  },
  {
    right: 375,
    left: 44,
    heading: 'قمری تاریخ کے لیے:',
    items: [
      ['IslamicFinder', 'https://www.islamicfinder.org'],
      ['Moon Sighting', 'https://www.moonsighting.com'],
    ],
  },
];

function drawReferences(p) {
  const by = 1356;
  p.box(30, by, 1006, 166, 14, { fill: '#fffdf6', stroke: THEME.gold });

  const tw = 580;
  const tx = 533 - tw / 2;
  const ty = 1338;
  p.shadowBox(tx, ty, tw, 38, 19, { fill: THEME.green, stroke: THEME.gold, lineWidth: 2.5, shadow: 'rgba(0,0,0,0.2)', blur: 4 });
  p.text('تاریخوں کی تصدیق کے لیے مفید حوالہ جات / References', 533, ty + 20, `700 21px ${FONT.urdu}, ${FONT.latin}`, '#fff');

  for (const col of REFERENCES) {
    p.text(col.heading, col.right, by + 34, `700 22px ${FONT.urdu}`, THEME.ink, { align: 'right' });
    col.items.forEach(([label, url], i) => {
      const yy = by + 68 + i * 48;
      p.text(label, col.left, yy, `700 19px ${FONT.latin}`, THEME.ink, { align: 'left', dir: 'ltr' });
      p.text(url, col.left, yy + 24, `400 16px ${FONT.latin}`, THEME.link, { align: 'left', dir: 'ltr' });
    });
  }
}

function drawFooter(p, name) {
  p.shadowBox(40, 1537, 986, 46, 4, {
    fill: p.vgrad(1537, 1583, THEME.greenLight, THEME.greenDark),
    stroke: THEME.gold,
    lineWidth: 2.5,
    shadow: 'rgba(0,0,0,0.25)',
    blur: 5,
  });
  const size = p.fitSize(name, '700', FONT.urdu, 30, 940);
  p.text(name, 533, 1559, `700 ${size}px ${FONT.urdu}`, '#fff');
}
