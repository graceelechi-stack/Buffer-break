// Toolbar icon options. Shared by the popup (previews, picking) and the
// service worker (re-applying the chosen icon when Chrome starts).
// The default "dots" icon is also what the PNGs in icons/ were rendered from.

const BB_ICONS = {
  default: 'dots',
  neutral: ['dots', 'cloud', 'note', 'leaf', 'ring'],
  emoji: ['☕', '🌿', '📎', '🧊', '🐢', '😴', '🍵', '📌'],
};

function bbDrawIcon(ctx, id, s) {
  const rect = (x, y, w, h, r, fill) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  };
  const circle = (x, y, r, fill) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  };

  ctx.clearRect(0, 0, s, s);
  switch (id) {
    case 'dots':
      rect(0, 0, s, s, s * 0.25, '#5b6472');
      [[0.35, 0.35], [0.65, 0.35], [0.35, 0.65], [0.65, 0.65]]
        .forEach(([x, y]) => circle(x * s, y * s, s * 0.09, '#fff'));
      return;
    case 'cloud':
      circle(s / 2, s / 2, s / 2, '#6b8bb5');
      circle(s * 0.4, s * 0.55, s * 0.16, '#fff');
      circle(s * 0.58, s * 0.47, s * 0.2, '#fff');
      rect(s * 0.24, s * 0.55, s * 0.54, s * 0.16, s * 0.08, '#fff');
      return;
    case 'note':
      rect(s * 0.06, s * 0.06, s * 0.88, s * 0.88, s * 0.16, '#e0a92e');
      [0.35, 0.5, 0.65].forEach((y, i) =>
        rect(s * 0.24, s * y - s * 0.035, s * (i === 2 ? 0.34 : 0.52), s * 0.07, s * 0.035, '#fff'));
      return;
    case 'leaf':
      circle(s / 2, s / 2, s / 2, '#4f8a64');
      ctx.beginPath();
      ctx.moveTo(s * 0.28, s * 0.72);
      ctx.bezierCurveTo(s * 0.25, s * 0.35, s * 0.5, s * 0.25, s * 0.74, s * 0.26);
      ctx.bezierCurveTo(s * 0.75, s * 0.5, s * 0.62, s * 0.75, s * 0.28, s * 0.72);
      ctx.fillStyle = '#fff';
      ctx.fill();
      return;
    case 'ring':
      circle(s / 2, s / 2, s / 2, '#8a8f98');
      circle(s / 2, s / 2, s * 0.26, '#fff');
      circle(s / 2, s / 2, s * 0.15, '#8a8f98');
      return;
    default: // an emoji
      ctx.font = `${Math.round(s * 0.86)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(id, s / 2, s * 0.54);
  }
}

async function bbApplyIcon(id) {
  if (id === BB_ICONS.default) {
    // The packaged PNGs are the default; use them so it stays pixel-crisp.
    await chrome.action.setIcon({ path: { 16: 'icons/icon16.png', 32: 'icons/icon32.png' } });
    return;
  }
  const imageData = {};
  for (const size of [16, 32]) {
    const ctx = new OffscreenCanvas(size, size).getContext('2d');
    bbDrawIcon(ctx, id, size);
    imageData[size] = ctx.getImageData(0, 0, size, size);
  }
  await chrome.action.setIcon({ imageData });
}
