/**
 * App screen: date picker, live poster preview, share/save buttons, settings.
 */
import { datesFor } from './calendars/index.js';
import { drawPoster, POSTER_WIDTH, POSTER_HEIGHT } from './poster/poster.js';
import { FONT_FACES } from './poster/theme.js';
import { quoteFor } from './quotes.js';
import { DEFAULTS, loadSettings, saveSettings } from './settings.js';
import { shareImage, saveImage } from './share.js';

const SCALE = 2; // output is 2132 × 3200 px
const $ = (id) => document.getElementById(id);
const pad2 = (n) => String(n).padStart(2, '0');

const canvas = document.createElement('canvas');
canvas.width = POSTER_WIDTH * SCALE;
canvas.height = POSTER_HEIGHT * SCALE;
const ctx = canvas.getContext('2d');

const settings = loadSettings();
const quoteOffsets = {}; // per-date "next/previous quote", this visit only
let current; // [year, month(0-based), day]
let lastBlob = null;
let drawSeq = 0;

// ------------------------------------------------------------------ drawing

function dayKey() {
  return Math.floor(Date.UTC(...current) / 86_400_000);
}

function setBusy(busy) {
  $('loading').hidden = !busy;
  $('shareBtn').disabled = busy;
  $('saveBtn').disabled = busy;
}

/** Redraw the poster for the current date and settings. */
function draw() {
  const seq = ++drawSeq;
  lastBlob = null;
  setBusy(true);

  // Let the loading spinner paint before the (synchronous) drawing starts.
  requestAnimationFrame(() =>
    setTimeout(() => {
      if (seq !== drawSeq) return;
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      drawPoster(ctx, {
        dates: datesFor(...current, { hijriAdjust: settings.hijriAdjust }),
        quote: quoteFor(...current, quoteOffsets[dayKey()] || 0),
        name: settings.name,
        message: settings.message,
      });
      canvas.toBlob((blob) => {
        if (seq !== drawSeq) return;
        const img = $('preview');
        img.onload = () => {
          if (seq !== drawSeq) return;
          lastBlob = blob;
          img.hidden = false;
          setBusy(false);
        };
        // A data: URL (not blob:) so "press and hold → Download image" works everywhere.
        img.src = canvas.toDataURL('image/jpeg', 0.95);
      }, 'image/png');
    }, 30),
  );
}

function setDate(year, month, day) {
  const d = new Date(Date.UTC(year, month, day));
  current = [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()];
  $('date').value = `${current[0]}-${pad2(current[1] + 1)}-${pad2(current[2])}`;
  draw();
}

function today() {
  const t = new Date();
  return [t.getFullYear(), t.getMonth(), t.getDate()];
}

// ------------------------------------------------------------------ sharing

function fileName() {
  return `calendar-${current[0]}-${pad2(current[1] + 1)}-${pad2(current[2])}.png`;
}

function showStatus(msg) {
  const el = $('status');
  el.textContent = msg;
  setTimeout(() => {
    if (el.textContent === msg) el.textContent = '';
  }, 5000);
}

function showPressAndHold() {
  const hint = $('hint');
  hint.classList.add('alert');
  hint.innerHTML =
    'تصویر پر انگلی دبا کر رکھیں، پھر <b>"Download image"</b> دبائیں۔<br>' +
    '<span class="en">Press and hold the picture, then tap "Download image".</span>';
  hint.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function handle(action) {
  if (!lastBlob) return;
  const result = await action(lastBlob, fileName());
  if (result === 'saved') showStatus('تصویر محفوظ ہو گئی ✓ — اب واٹس ایپ اسٹیٹس میں گیلری سے لگائیں');
  if (result === 'hold') showPressAndHold();
}

// ------------------------------------------------------------------ events

$('date').addEventListener('change', (e) => {
  if (!e.target.value) return;
  const [y, m, d] = e.target.value.split('-').map(Number);
  setDate(y, m - 1, d);
});
$('prev').onclick = () => setDate(current[0], current[1], current[2] - 1);
$('next').onclick = () => setDate(current[0], current[1], current[2] + 1);
$('todayBtn').onclick = () => setDate(...today());
$('shareBtn').onclick = () => handle(shareImage);
$('saveBtn').onclick = () => handle(saveImage);

$('hadj').onchange = (e) => {
  settings.hijriAdjust = Number(e.target.value);
  saveSettings(settings);
  draw();
};
$('quoteNext').onclick = () => {
  quoteOffsets[dayKey()] = (quoteOffsets[dayKey()] || 0) + 1;
  draw();
};
$('quotePrev').onclick = () => {
  quoteOffsets[dayKey()] = (quoteOffsets[dayKey()] || 0) - 1;
  draw();
};
$('quoteAuto').onclick = () => {
  delete quoteOffsets[dayKey()];
  draw();
};

let typingTimer;
function onTextSetting(key, fallback) {
  return (e) => {
    settings[key] = e.target.value.trim() || fallback;
    saveSettings(settings);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(draw, 400);
  };
}
$('nameIn').oninput = onTextSetting('name', DEFAULTS.name);
$('messageIn').oninput = onTextSetting('message', DEFAULTS.message);

$('resetBtn').onclick = () => {
  Object.assign(settings, DEFAULTS);
  saveSettings(settings);
  for (const k of Object.keys(quoteOffsets)) delete quoteOffsets[k];
  fillSettingsForm();
  draw();
};

function fillSettingsForm() {
  $('hadj').value = String(settings.hijriAdjust);
  $('nameIn').value = settings.name;
  $('messageIn').value = settings.message;
}

// ------------------------------------------------------------------ start

async function start() {
  fillSettingsForm();
  try {
    await document.fonts.ready;
    await Promise.all(FONT_FACES.map((f) => document.fonts.load(f, 'ابc12')));
  } catch {
    /* draw with whatever fonts are available */
  }
  setDate(...today());
}

start();
