/**
 * Small canvas helpers: rounded rectangles, RTL-aware text, fitting and wrapping.
 * All coordinates are in poster units (see POSTER_WIDTH / POSTER_HEIGHT).
 */
export function createPainter(ctx) {
  function roundRect(x, y, w, h, r) {
    const [a, b, c, d] = typeof r === 'number' ? [r, r, r, r] : r;
    ctx.beginPath();
    ctx.moveTo(x + a, y);
    ctx.lineTo(x + w - b, y);
    ctx.arcTo(x + w, y, x + w, y + b, b);
    ctx.lineTo(x + w, y + h - c);
    ctx.arcTo(x + w, y + h, x + w - c, y + h, c);
    ctx.lineTo(x + d, y + h);
    ctx.arcTo(x, y + h, x, y + h - d, d);
    ctx.lineTo(x, y + a);
    ctx.arcTo(x, y, x + a, y, a);
    ctx.closePath();
  }

  function box(x, y, w, h, r, { fill, stroke, lineWidth = 2 } = {}) {
    roundRect(x, y, w, h, r);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  /** Draw a box with a soft drop shadow, then its border without shadow. */
  function shadowBox(x, y, w, h, r, { fill, stroke, lineWidth, shadow = 'rgba(0,0,0,0.18)', blur = 8 } = {}) {
    ctx.save();
    ctx.shadowColor = shadow;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetY = 2;
    box(x, y, w, h, r, { fill });
    ctx.restore();
    if (stroke) box(x, y, w, h, r, { stroke, lineWidth });
  }

  /** Vertical two-stop gradient. */
  function vgrad(y0, y1, top, bottom) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    return g;
  }

  /**
   * Draw one line of text, vertically centred on y.
   * dir: 'rtl' for Urdu/Arabic (default), 'ltr' for English.
   */
  function text(str, x, y, font, color, { align = 'center', dir = 'rtl' } = {}) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.direction = dir;
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  }

  function width(str, font, dir = 'rtl') {
    ctx.font = font;
    ctx.direction = dir;
    return ctx.measureText(str).width;
  }

  /** Largest font size (<= size) at which str fits in maxWidth. */
  function fitSize(str, weight, family, size, maxWidth, dir = 'rtl') {
    while (size > 10 && width(str, `${weight} ${size}px ${family}`, dir) > maxWidth) size--;
    return size;
  }

  /** Greedy word wrap. */
  function wrap(str, font, maxWidth) {
    const lines = [];
    let current = '';
    for (const word of str.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && width(candidate, font) > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  /**
   * Split into two lines of similar width. Prefers breaking after an Urdu comma
   * ("،") close to the middle, so phrases stay together.
   */
  function splitInTwo(str, font) {
    const commas = [...str.matchAll(/،/g)].map((m) => m.index);
    if (commas.length) {
      const mid = str.length / 2;
      const at = commas.reduce((best, i) => (Math.abs(i - mid) < Math.abs(best - mid) ? i : best));
      return [str.slice(0, at + 1).trim(), str.slice(at + 1).trim()];
    }
    const target = width(str, font) / 2;
    const words = str.split(/\s+/);
    let first = '';
    let i = 0;
    for (; i < words.length - 1; i++) {
      const next = first ? `${first} ${words[i]}` : words[i];
      if (first && width(next, font) > target * 1.02) break;
      first = next;
    }
    return [first, words.slice(i).join(' ')];
  }

  return { ctx, roundRect, box, shadowBox, vgrad, text, width, fitSize, wrap, splitInTwo };
}
