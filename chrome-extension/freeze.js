// Buffer Break — injected into the page.
// Covers the page with a screenshot of itself, swallows all input, and shows a
// Chrome-style "Page Unresponsive" dialog. Only the secret combo (or the timer)
// ends it, and the screenshot is dropped when it does.

(() => {
  if (window.__bufferBreak) return;

  const DIALOG_DELAY_MS = 5000;
  const DIALOG_RETURN_MS = 15000; // "Wait" hides the dialog, then it comes back
  const BLOCKED_EVENTS = [
    'keydown', 'keyup', 'keypress', 'mousedown', 'mouseup', 'click', 'dblclick',
    'pointerdown', 'pointerup', 'pointermove', 'mousemove', 'wheel', 'contextmenu',
    'touchstart', 'touchmove', 'touchend', 'copy', 'cut', 'paste', 'dragstart', 'drop',
  ];

  // Ctrl+U (Cmd+U on Mac). Only listened for while frozen, so the page keeps
  // its own Ctrl+U the rest of the time.
  const isUnfreezeCombo = (e) =>
    e.type === 'keydown' && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.code === 'KeyU';

  const STYLES = `
    :host { all: initial; }
    .stage {
      position: fixed; inset: 0; z-index: 2147483647;
      cursor: default; user-select: none; -webkit-user-select: none;
    }
    .shot { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
    .dialog {
      --bg: #fff; --title: #1f1f1f; --text: #474747;
      --primary: #0b57d0; --on-primary: #fff; --outline: #747775;
      position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
      width: 420px; max-width: calc(100% - 32px); padding: 24px; box-sizing: border-box;
      font-family: system-ui, "Segoe UI", Roboto, sans-serif;
      background: var(--bg); border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 4px 8px 3px rgba(0,0,0,.15);
    }
    .dialog[hidden] { display: none; }
    h2 { margin: 0 0 12px; font-size: 15px; font-weight: 500; color: var(--title); }
    p { margin: 0 0 24px; font-size: 13px; line-height: 20px; color: var(--text); }
    .buttons { display: flex; justify-content: flex-end; gap: 8px; }
    button {
      height: 36px; padding: 0 16px; font: 500 13px system-ui, "Segoe UI", Roboto, sans-serif;
      border-radius: 18px; cursor: default;
      color: var(--primary); background: transparent; border: 1px solid var(--outline);
    }
    button.primary { color: var(--on-primary); background: var(--primary); border-color: var(--primary); }
    @media (prefers-color-scheme: dark) {
      .dialog {
        --bg: #2d2e31; --title: #e3e3e3; --text: #c4c7c5;
        --primary: #a8c7fa; --on-primary: #062e6f; --outline: #8e918f;
      }
    }
  `;

  let host = null;
  let timers = [];

  function swallow(e) {
    const onDialogButton = e.composedPath().some((el) => el.dataset && el.dataset.action);
    if (isUnfreezeCombo(e)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      unfreeze();
      return;
    }
    // Let clicks reach our own dialog buttons; block everything else.
    if (onDialogButton && (e.type === 'click' || e.type === 'mousedown' || e.type === 'pointerdown')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  function freeze(image, minutes) {
    if (host) return;

    host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>${STYLES}</style>
      <div class="stage">
        <img class="shot" alt="">
        <div class="dialog" role="dialog" hidden>
          <h2>Page Unresponsive</h2>
          <p>You can wait for it to become responsive or exit the page.</p>
          <div class="buttons">
            <button data-action="exit">Exit page</button>
            <button class="primary" data-action="wait">Wait</button>
          </div>
        </div>
      </div>`;
    root.querySelector('.shot').src = image;
    const dialog = root.querySelector('.dialog');

    // "Wait" behaves like the real one: the dialog goes away, then returns.
    root.querySelector('[data-action="wait"]').addEventListener('click', () => {
      dialog.hidden = true;
      timers.push(setTimeout(() => { dialog.hidden = false; }, DIALOG_RETURN_MS));
    });

    document.documentElement.appendChild(host);
    BLOCKED_EVENTS.forEach((type) =>
      window.addEventListener(type, swallow, { capture: true, passive: false }));
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();

    timers.push(setTimeout(() => { dialog.hidden = false; }, DIALOG_DELAY_MS));
    if (minutes > 0) timers.push(setTimeout(unfreeze, minutes * 60 * 1000));
  }

  function unfreeze() {
    if (!host) return;
    timers.forEach(clearTimeout);
    timers = [];
    BLOCKED_EVENTS.forEach((type) =>
      window.removeEventListener(type, swallow, { capture: true }));
    host.remove();
    host = null; // drops the only reference to the screenshot
  }

  window.__bufferBreak = { freeze, unfreeze };
})();
