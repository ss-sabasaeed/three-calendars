/**
 * Builds dist/index.html: one self-contained file with the JavaScript bundle,
 * the CSS and all fonts inlined, so the app works offline and can be opened
 * from anywhere (GitHub Pages, a phone's browser, a WebView in the APK).
 *
 *   npm run build
 */
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (p) => path.join(root, 'src', p);

// Arabic-script ranges (from Fontsource) so each subset file is only used where needed.
const ARABIC_RANGE =
  'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FEFF';

const FONTS = [
  // family, weight, file, arabic subset?
  ['NotoNaskh', 400, 'noto-naskh-arabic-arabic-400-normal.woff2', true],
  ['NotoNaskh', 500, 'noto-naskh-arabic-arabic-500-normal.woff2', true],
  ['NotoNaskh', 700, 'noto-naskh-arabic-arabic-700-normal.woff2', true],
  ['NotoNaskh', 400, 'noto-naskh-arabic-latin-400-normal.woff2', false],
  ['NotoNaskh', 500, 'noto-naskh-arabic-latin-500-normal.woff2', false],
  ['NotoNaskh', 700, 'noto-naskh-arabic-latin-700-normal.woff2', false],
  ['AmiriQuran', 400, 'amiri-quran-arabic-400-normal.woff2', true],
  ['Amiri', 700, 'amiri-arabic-700-normal.woff2', true],
  ['Amiri', 700, 'amiri-latin-700-normal.woff2', false],
  ['NotoSans', 400, 'noto-sans-latin-400-normal.woff2', false],
  ['NotoSans', 700, 'noto-sans-latin-700-normal.woff2', false],
  ['NotoSans', 800, 'noto-sans-latin-800-normal.woff2', false],
];

async function fontFaces() {
  const rules = await Promise.all(
    FONTS.map(async ([family, weight, file, arabic]) => {
      const data = (await readFile(src(`fonts/${file}`))).toString('base64');
      const range = arabic ? `unicode-range:${ARABIC_RANGE};` : '';
      return `@font-face{font-family:${family};font-weight:${weight};font-display:block;${range}src:url(data:font/woff2;base64,${data}) format('woff2')}`;
    }),
  );
  return rules.join('\n');
}

async function bundle() {
  const result = await build({
    entryPoints: [src('js/main.js')],
    bundle: true,
    format: 'iife',
    target: ['chrome90', 'safari14', 'firefox90'],
    minify: true,
    write: false,
    loader: { '.json': 'json' },
  });
  return result.outputFiles[0].text;
}

const [html, css, fonts, js] = await Promise.all([
  readFile(src('index.html'), 'utf8'),
  readFile(src('styles.css'), 'utf8'),
  fontFaces(),
  bundle(),
]);

// Escape "</script" so the inlined bundle cannot close its own tag.
const safeJs = js.replace(/<\/script/gi, '<\\/script');
const out = html
  .replace('<!-- build:css -->', () => `<style>\n${fonts}\n${css}</style>`)
  .replace('<!-- build:js -->', () => `<script>\n${safeJs}</script>`);

await mkdir(path.join(root, 'dist'), { recursive: true });
await writeFile(path.join(root, 'dist', 'index.html'), out);
console.log(`dist/index.html  ${(out.length / 1024).toFixed(0)} KB`);
