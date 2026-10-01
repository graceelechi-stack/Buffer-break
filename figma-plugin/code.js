// Buffer Break — main thread.
// Renders what's visible on the canvas, hands it to the UI, then stretches the
// plugin window over the canvas so the snapshot looks like a frozen Figma.
// Nothing is written to the document; the snapshot lives only in memory.

const LAUNCHER_SIZE = { width: 280, height: 335 };
const MAX_EXPORT_EDGE = 8192; // px; keeps huge frames at high zoom from blowing up
const FALLBACK_BACKGROUND = 'rgb(245, 245, 245)';

let pendingWindow = null;

figma.showUI(__html__, Object.assign({ title: ' ', themeColors: true }, LAUNCHER_SIZE));

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
    a.y < b.y + b.height && a.y + a.height > b.y;
}

function toCss(color) {
  const c = (v) => Math.round(v * 255);
  return `rgb(${c(color.r)}, ${c(color.g)}, ${c(color.b)})`;
}

function pageBackground(page) {
  const paint = page.backgrounds.find((p) => p.type === 'SOLID' && p.visible !== false);
  return paint ? toCss(paint.color) : FALLBACK_BACKGROUND;
}

async function captureViewport() {
  const page = figma.currentPage;
  const view = figma.viewport.bounds;
  const zoom = figma.viewport.zoom;
  const images = [];

  for (const node of page.children) {
    if (!node.visible) continue;
    const box = node.absoluteRenderBounds;
    if (!box || !intersects(box, view)) continue;

    // Export at 2x the on-screen size so it stays sharp on high-DPI displays.
    let scale = Math.min(zoom * 2, 4);
    const longest = Math.max(box.width, box.height) * scale;
    if (longest > MAX_EXPORT_EDGE) scale *= MAX_EXPORT_EDGE / longest;

    try {
      const bytes = await node.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: scale },
      });
      images.push({ bytes, x: box.x, y: box.y, width: box.width, height: box.height });
    } catch (e) {
      // Some nodes can't be exported (e.g. empty groups); skip them.
    }
  }

  return {
    bounds: { x: view.x, y: view.y, width: view.width, height: view.height },
    zoom,
    background: pageBackground(page),
    images,
  };
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'start') {
    try {
      const snapshot = await captureViewport();
      pendingWindow = {
        x: snapshot.bounds.x,
        y: snapshot.bounds.y,
        width: Math.round(snapshot.bounds.width * snapshot.zoom),
        height: Math.round(snapshot.bounds.height * snapshot.zoom),
      };
      figma.ui.postMessage({ type: 'snapshot', snapshot, minutes: msg.minutes });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String(e && e.message ? e.message : e) });
    }
  } else if (msg.type === 'ready' && pendingWindow) {
    // The UI has drawn the snapshot; now cover the canvas with it.
    figma.ui.resize(pendingWindow.width, pendingWindow.height);
    figma.ui.reposition(pendingWindow.x, pendingWindow.y);
    pendingWindow = null;
  } else if (msg.type === 'cover') {
    // Transparency test: cover the visible canvas without drawing anything.
    const view = figma.viewport.bounds;
    const zoom = figma.viewport.zoom;
    figma.ui.resize(Math.round(view.width * zoom), Math.round(view.height * zoom));
    figma.ui.reposition(view.x, view.y);
  } else if (msg.type === 'probe') {
    // Coverage test: ask for a screen-sized window pushed far up and left, and
    // let the UI measure how much of that Figma actually allows.
    const view = figma.viewport.bounds;
    const zoom = figma.viewport.zoom;
    figma.ui.resize(msg.width, msg.height);
    figma.ui.reposition(view.x - msg.width / zoom, view.y - msg.height / zoom);
    figma.ui.postMessage({
      type: 'probed',
      requested: { width: msg.width, height: msg.height },
      canvas: { width: Math.round(view.width * zoom), height: Math.round(view.height * zoom) },
    });
  } else if (msg.type === 'done') {
    pendingWindow = null;
    figma.closePlugin();
  }
};
