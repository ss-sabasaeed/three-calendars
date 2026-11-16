/**
 * Simple mosque silhouette (domes and minarets).
 * (x, y) is the bottom-left corner; the drawing is 240 × 120 units at scale 1.
 */
export function drawMosque(ctx, x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;

  ctx.fillRect(0, -4, 240, 4); // ground line

  const minaret = (mx) => {
    ctx.fillRect(mx, -62, 12, 58);
    ctx.beginPath();
    ctx.moveTo(mx - 3, -62);
    ctx.lineTo(mx + 15, -62);
    ctx.lineTo(mx + 6, -84);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(mx - 3, -44, 18, 4); // balcony
    ctx.fillRect(mx + 5, -90, 2, 8); // spire
  };
  minaret(16);
  minaret(212);

  // Side halls with small domes.
  ctx.fillRect(40, -38, 46, 34);
  ctx.fillRect(154, -38, 46, 34);
  for (const cx of [63, 177]) {
    ctx.beginPath();
    ctx.arc(cx, -38, 20, Math.PI, 0);
    ctx.fill();
  }

  // Central hall and main dome with finial.
  ctx.fillRect(78, -50, 84, 46);
  ctx.beginPath();
  ctx.moveTo(80, -50);
  ctx.bezierCurveTo(80, -82, 100, -92, 120, -100);
  ctx.bezierCurveTo(140, -92, 160, -82, 160, -50);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(119, -114, 2, 16);
  ctx.beginPath();
  ctx.arc(120, -117, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Lit doorway.
  ctx.fillStyle = '#f3e1a3';
  ctx.beginPath();
  ctx.moveTo(110, -4);
  ctx.lineTo(110, -26);
  ctx.arc(120, -26, 10, Math.PI, 0);
  ctx.lineTo(130, -4);
  ctx.closePath();
  ctx.fill();

  // Arched windows.
  ctx.fillStyle = '#fbf3dc';
  for (const wx of [52, 70, 166, 184]) {
    ctx.beginPath();
    ctx.moveTo(wx, -10);
    ctx.lineTo(wx, -22);
    ctx.arc(wx + 4, -22, 4, Math.PI, 0);
    ctx.lineTo(wx + 8, -10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
