const DEFAULT_SETTINGS = { mode: 'manual', minutes: 10 };
const PRESETS = [5, 10, 15, 30];
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function clampMinutes(value) {
  return Math.min(240, Math.max(1, Math.round(Number(value)) || DEFAULT_SETTINGS.minutes));
}

let settings = { ...DEFAULT_SETTINGS };

function render({ mode, minutes }) {
  $(`input[name="mode"][value="${mode}"]`).checked = true;
  $('#timer').hidden = mode !== 'timed';
  // The custom box only shows a value that isn't one of the preset chips.
  if (document.activeElement !== $('#minutes')) {
    $('#minutes').value = PRESETS.includes(minutes) ? '' : minutes;
  }
  $('.custom').classList.toggle('active', !PRESETS.includes(minutes));
  $$('.chip').forEach((chip) => {
    chip.setAttribute('aria-pressed', String(Number(chip.dataset.minutes) === minutes));
  });
}

async function save(changes) {
  settings = { ...settings, ...changes };
  render(settings);
  await chrome.storage.local.set(settings);
}

async function init() {
  settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  render(settings);

  // Show the freeze shortcut the user actually has set.
  const [command] = (await chrome.commands.getAll()).filter((c) => c.name === 'freeze');
  if (command) {
    $('#freeze-keys').innerHTML = command.shortcut
      ? command.shortcut.split('+').map((k) => `<kbd>${k}</kbd>`).join('')
      : '<kbd>Not set</kbd>';
  }
}

$$('input[name="mode"]').forEach((el) => el.addEventListener('change', () => save({ mode: el.value })));
$$('.chip').forEach((chip) => chip.addEventListener('click', () => {
  save({ mode: 'timed', minutes: Number(chip.dataset.minutes) });
}));
$('#minutes').addEventListener('change', () => {
  if ($('#minutes').value === '') return;
  save({ mode: 'timed', minutes: clampMinutes($('#minutes').value) });
});
$('#minutes').addEventListener('blur', () => render(settings));

// Toolbar icon picker: a collapsed row showing the current icon that expands
// into the grid of neutral icons and emoji.
function drawCurrentIcon(id) {
  const canvas = $('#current-icon');
  canvas.width = canvas.height = Math.round(20 * (window.devicePixelRatio || 1));
  bbDrawIcon(canvas.getContext('2d'), id, canvas.width);
}

function setIconPanelOpen(open) {
  $('#icon-toggle').setAttribute('aria-expanded', String(open));
  $('#icon-panel').inert = !open; // keep hidden buttons out of the tab order
}

$('#icon-toggle').addEventListener('click', () => {
  setIconPanelOpen($('#icon-toggle').getAttribute('aria-expanded') !== 'true');
});

async function initIcons() {
  const { icon } = await chrome.storage.local.get({ icon: BB_ICONS.default });
  const dpr = window.devicePixelRatio || 1;
  setIconPanelOpen(false);
  drawCurrentIcon(icon);
  for (const id of [...BB_ICONS.neutral, ...BB_ICONS.emoji]) {
    const button = document.createElement('button');
    button.className = 'icon-option';
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', String(id === icon));
    button.setAttribute('aria-label', id);
    button.title = id;

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = Math.round(20 * dpr);
    bbDrawIcon(canvas.getContext('2d'), id, canvas.width);
    button.appendChild(canvas);

    button.addEventListener('click', async () => {
      $$('.icon-option').forEach((b) => b.setAttribute('aria-checked', String(b === button)));
      drawCurrentIcon(id);
      await chrome.storage.local.set({ icon: id });
      await bbApplyIcon(id);
    });
    $('#icons').appendChild(button);
  }
}

$('#change-keys').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});

$('#freeze').addEventListener('click', async () => {
  const result = await chrome.runtime.sendMessage({ type: 'freeze' });
  if (result && result.ok) {
    window.close();
  } else {
    $('#error').textContent = (result && result.error) || 'Could not freeze this tab.';
    $('#error').hidden = false;
  }
});

init();
initIcons();
