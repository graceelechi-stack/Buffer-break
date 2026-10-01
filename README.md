# Buffer Break

> Go on, stretch, sip, scroll. We'll blame the browser. 😉

**Buffer Break** is a Chrome extension that makes the tab you're on look
frozen. It takes a real screenshot of the page, covers the page with it so
nothing can be clicked or typed into, and then shows Chrome's familiar
**"Page Unresponsive"** message. To everyone else, the page just hung. To you,
it's a break.

It was built with Figma in mind, but it works on almost any website. It runs in
**Google Chrome**, **Microsoft Edge** and **Brave**.

In your browser it appears as **FocusFlow: Workspace Optimizer**, so it looks
like an ordinary productivity tool in your toolbar and extensions list. Its
description still says what it really does.

---

## Contents

- [What it does](#what-it-does)
- [Install (about 2 minutes)](#install-about-2-minutes)
- [How to use it](#how-to-use-it)
- [Settings](#settings)
- [Troubleshooting](#troubleshooting)
- [Privacy and permissions](#privacy-and-permissions)
- [Updating and uninstalling](#updating-and-uninstalling)
- [Project structure](#project-structure)
- [The Figma plugin (experimental)](#the-figma-plugin-experimental)

---

## What it does

1. You press **Alt + Shift + F** (or click **Freeze this tab** in the popup).
2. The extension takes a screenshot of the current tab and lays it over the
   page. The page looks exactly the same, but nothing reacts: no clicks, no
   scrolling, no typing.
3. After about 5 seconds, a **"Page Unresponsive"** box appears with
   **Exit page** and **Wait** buttons, matching your light or dark mode.
   - **Wait** hides the box, and it comes back 15 seconds later, just like the
     real one.
   - **Exit page** does nothing.
4. When you're ready, press **Ctrl + U** and the page is back to normal
   instantly. You can also set a timer to unfreeze automatically.

---

## Install (about 2 minutes)

The extension isn't on the Chrome Web Store, so you load it yourself using
Chrome's **Developer mode**. Nothing extra needs to be installed.

### 1. Download it

Go to the [**Releases**](../../releases) page, open the latest release, and
download **`buffer-break-extension.zip`**.

Prefer the code? Click the green **Code** button → **Download ZIP**, then use
the `chrome-extension` folder inside it in step 3.

### 2. Unzip it

- **Windows:** right-click the zip → **Extract All…** → **Extract**.
- **Mac:** double-click the zip.

You'll get a folder called **`buffer-break-extension`**. Put it somewhere it
can stay, such as your Documents folder. **Don't delete or move it later**:
Chrome loads the extension from this folder every time it starts.

### 3. Load it into your browser

1. Open a new tab and go to:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
2. Turn on **Developer mode**. It's a switch in the top-right corner (in Edge,
   it's in the left sidebar).
3. Click **Load unpacked**.
4. Select the **`buffer-break-extension`** folder (the one that contains
   `manifest.json`) and click **Select Folder**.

You'll see **FocusFlow: Workspace Optimizer** appear in your extensions list.

### 4. (Optional) Pin it to your toolbar

Click the puzzle-piece icon 🧩 next to the address bar and click the pin next
to **FocusFlow**. You don't have to: the keyboard shortcut works either way.

---

## How to use it

| Action | How |
|---|---|
| **Freeze** the current tab | Press **Alt + Shift + F**, or click the toolbar icon → **Freeze this tab** |
| **Unfreeze** | Press **Ctrl + U** (**Cmd + U** on Mac) |
| **Unfreeze automatically** | In the popup, choose **Timer** and pick a duration before freezing |

**Quick test:** open any website, press **Alt + Shift + F**, try clicking
around (nothing happens), wait for the "Page Unresponsive" box, then press
**Ctrl + U**.

Ctrl + U only unfreezes while a page is frozen. The rest of the time it does
whatever it normally does on that site.

---

## Settings

Click the toolbar icon to open the popup.

- **Duration:** **Until I unfreeze** (default) keeps the page frozen until you
  press Ctrl + U. **Timer** unfreezes it automatically after 5, 10, 15 or 30
  minutes, or any number of minutes you type into **Other** (up to 240).
- **Freeze shortcut:** click the ✏️ pencil to change **Alt + Shift + F**. This
  opens Chrome's shortcut settings. Chrome requires shortcuts to include
  **Ctrl** or **Alt**.
- **Toolbar icon:** click the **Toolbar icon** row to pick a different icon.
  You can choose from neutral icons (dots, cloud, note, leaf, ring) or emoji
  (☕ 🌿 📎 🧊 🐢 😴 🍵 📌). The default is a plain grey dots icon that gives
  nothing away. This only changes the toolbar icon; the extensions page always
  shows the default.

Your settings are saved and remembered.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Alt + Shift + F does nothing** | Another extension may already use that shortcut. Go to `chrome://extensions/shortcuts`, find **FocusFlow**, and set a different one. Or click the toolbar icon → **Freeze this tab**. |
| **"Chrome doesn't let extensions touch this page"** | Chrome blocks every extension on its own pages: `chrome://` pages, the New Tab page, the Chrome Web Store and the built-in PDF viewer. Try it on a normal website. |
| **It doesn't work on a file opened from my computer** | Go to `chrome://extensions`, click **Details** under FocusFlow, and turn on **Allow access to file URLs**. |
| **Ctrl + U doesn't unfreeze** | Click once anywhere on the frozen page so the page has keyboard focus, then press Ctrl + U again. As a last resort, clicking the browser's reload button ↻ always unfreezes it (F5 won't, because every key is blocked while frozen). |
| **"Load unpacked" or Developer mode is missing or greyed out** | Your device is probably managed by a school or company that blocks custom extensions. Use a personal device, or ask your IT team. |
| **The extension disappeared after a restart** | The folder was probably moved or deleted. Put it back (or download it again) and repeat **Load unpacked**. |
| **Chrome shows a "Disable developer mode extensions" warning** | That's normal for extensions loaded this way. Click the ✕ or **Cancel** to keep it. |

---

## Privacy and permissions

Buffer Break doesn't collect, store or send any data. It makes no network
requests at all.

- The **screenshot** is held only in memory while the page is frozen. It's
  never saved to disk or uploaded, and it's discarded the moment you unfreeze.
- The only things saved are your **settings** (duration, timer length and
  toolbar icon), stored locally in your browser.

What each permission is for:

| Permission | Why it's needed |
|---|---|
| `activeTab` | To screenshot and freeze **only the tab you're on**, and only when you press the shortcut or click **Freeze**. It gets no access to your other tabs or your browsing history. |
| `scripting` | To place the frozen screenshot and the "Page Unresponsive" box on top of that page. |
| `storage` | To remember your settings. |

---

## Updating and uninstalling

**Update:** download the new release, replace the old folder's contents with
the new ones, then go to `chrome://extensions` and click the ↻ reload icon on
the **FocusFlow** card.

**Uninstall:** go to `chrome://extensions` and click **Remove** on the
**FocusFlow** card. You can then delete the folder.

---

## Project structure

```
buffer-break/
├── chrome-extension/        The Chrome extension (this is what you install)
│   ├── manifest.json        Name, permissions and the Alt+Shift+F shortcut
│   ├── background.js        Takes the screenshot and starts the freeze
│   ├── freeze.js            Runs in the page: overlay, input blocking, dialog, Ctrl+U
│   ├── popup.html / .js     The settings popup
│   ├── icons.js             Toolbar icon options (drawn in code)
│   └── icons/               Default icon images
└── figma-plugin/            Earlier Figma desktop-app version (experimental)
```

No build step, frameworks or dependencies: it's plain HTML, CSS and
JavaScript. To work on it, edit the files in `chrome-extension/`, then click ↻
on the extension's card at `chrome://extensions` to reload it.

---

## The Figma plugin (experimental)

`figma-plugin/` contains the first version of this idea, built as a plugin for
the Figma desktop app. Figma plugins can't take real screenshots, cover
Figma's side panels, or hide their own title bar, so it isn't as convincing as
the Chrome extension. It also still contains two diagnostic buttons
(**Test coverage** and **Test transparency**) from that experiment.

To try it: in the Figma desktop app, open a design file, then go to
**Menu → Plugins → Development → Import plugin from manifest…** and choose
`figma-plugin/manifest.json`. Freeze with the **Freeze** button and unfreeze
with **Ctrl + Alt + Shift + B**.

---

Take breaks responsibly. 😉
