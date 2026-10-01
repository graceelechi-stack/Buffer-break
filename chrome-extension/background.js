// Buffer Break — service worker.
// Screenshots the visible tab and hands it to freeze.js, which covers the page.
// The screenshot is never stored; it only passes through here in memory.

importScripts('icons.js');

const DEFAULT_SETTINGS = { mode: 'manual', minutes: 10 };

// Chrome forgets icons set at runtime when it restarts, so put the chosen one back.
async function restoreIcon() {
  const { icon } = await chrome.storage.local.get({ icon: BB_ICONS.default });
  if (icon !== BB_ICONS.default) await bbApplyIcon(icon);
}
chrome.runtime.onStartup.addListener(restoreIcon);
chrome.runtime.onInstalled.addListener(restoreIcon);

async function freezeTab(tab) {
  if (!tab || !/^(https?|file):/.test(tab.url || '')) {
    throw new Error("Chrome doesn't let extensions touch this page. Try it on a regular website.");
  }
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  const minutes = settings.mode === 'timed' ? settings.minutes : 0;

  const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

  await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['freeze.js'] });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (image, mins) => window.__bufferBreak.freeze(image, mins),
    args: [screenshot, minutes],
  });
}

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'freeze') freezeTab(tab).catch((e) => console.warn(e.message));
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== 'freeze') return;
  chrome.tabs.query({ active: true, currentWindow: true })
    .then(([tab]) => freezeTab(tab))
    .then(() => sendResponse({ ok: true }), (e) => sendResponse({ ok: false, error: e.message }));
  return true; // keep the channel open for the async response
});
