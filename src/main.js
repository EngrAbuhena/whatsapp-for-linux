'use strict';

const { app, BrowserWindow, Tray, Menu, shell, nativeImage, nativeTheme, session, Notification, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const WHATSAPP_URL = 'https://web.whatsapp.com/';
const isDev = process.argv.includes('--dev') || !app.isPackaged;

// A modern Chrome UA — WhatsApp Web rejects outdated / Electron UAs.
const CHROME_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

/* ------------------------------------------------------------------ */
/* Persistent settings (no external deps — plain JSON in userData)     */
/* ------------------------------------------------------------------ */
const DEFAULTS = {
  closeToTray: true,
  startMinimized: false,
  autostart: false,
  spellcheck: true,
  theme: 'system', // system | light | dark
  zoomLevel: 0,
};

function readJSON(file, fallback) {
  try { return { ...fallback, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; }
  catch { return { ...fallback }; }
}
function writeJSON(file, data) {
  try { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch {}
}

const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
const windowStateFile = () => path.join(app.getPath('userData'), 'window-state.json');
let settings = { ...DEFAULTS };
let windowState = { width: 1100, height: 760, x: undefined, y: undefined, isMaximized: false };

/* ------------------------------------------------------------------ */
/* Single instance                                                     */
/* ------------------------------------------------------------------ */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => showWindow());
}

let mainWindow = null;
let tray = null;
let isQuitting = false;
let unreadCount = 0;

/* ------------------------------------------------------------------ */
/* Window                                                              */
/* ------------------------------------------------------------------ */
function createWindow() {
  nativeTheme.themeSource = settings.theme;

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 760,
    minHeight: 520,
    show: false,
    autoHideMenuBar: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#111b21' : '#f0f2f5',
    icon: iconImage(512),
    title: 'WhatsApp for Linux',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: settings.spellcheck,
      backgroundThrottling: false, // keep notifications/calls alive in tray
    },
  });

  if (windowState.isMaximized) mainWindow.maximize();
  mainWindow.webContents.setUserAgent(CHROME_UA);
  mainWindow.webContents.setZoomLevel(settings.zoomLevel);

  mainWindow.once('ready-to-show', () => {
    if (!settings.startMinimized && !process.argv.includes('--hidden')) showWindow();
  });

  mainWindow.loadURL(WHATSAPP_URL, { userAgent: CHROME_UA });

  // Persist window state (debounced by 'close' + periodic resize/move save)
  const saveState = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const bounds = mainWindow.getBounds();
    windowState = { ...bounds, isMaximized: mainWindow.isMaximized() };
    writeJSON(windowStateFile(), windowState);
  };
  mainWindow.on('resize', saveState);
  mainWindow.on('move', saveState);

  // Close to tray (default) instead of quitting
  mainWindow.on('close', (event) => {
    saveState();
    if (!isQuitting && settings.closeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  /* Unread badge: WhatsApp title becomes "(3) WhatsApp" */
  mainWindow.on('page-title-updated', (_event, title) => {
    const match = title.match(/\((\d+)\)/);
    const count = match ? parseInt(match[1], 10) : 0;
    if (count !== unreadCount) {
      unreadCount = count;
      app.setBadgeCount(count); // dock / launcher badge on Ubuntu
      updateTray();
      if (count > 0 && !mainWindow.isFocused()) mainWindow.flashFrame(true);
    }
  });
  mainWindow.on('focus', () => mainWindow.flashFrame(false));

  /* External links -> default browser (never inside the app) */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://web.whatsapp.com')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('https://web.whatsapp.com') && !url.startsWith('https://wa.me')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  /* Right-click menu: copy/paste/spellcheck/zoom — essential on Linux */
  mainWindow.webContents.on('context-menu', (_e, params) => {
    const items = [];
    if (params.dictionarySuggestions?.length && params.misspelledWord) {
      for (const suggestion of params.dictionarySuggestions) {
        items.push({ label: suggestion, click: () => mainWindow.webContents.replaceMisspelling(suggestion) });
      }
      items.push({ type: 'separator' });
    }
    if (params.mediaType === 'image') {
      items.push({ label: 'Save Image As…', click: () => mainWindow.webContents.downloadURL(params.srcURL) });
    }
    items.push(
      { label: 'Cut', role: 'cut', enabled: params.editFlags.canCut },
      { label: 'Copy', role: 'copy', enabled: params.editFlags.canCopy },
      { label: 'Paste', role: 'paste', enabled: params.editFlags.canPaste },
      { label: 'Select All', role: 'selectAll' },
      { type: 'separator' },
      { label: 'Reload', click: () => mainWindow.webContents.reload() },
      { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: () => setZoom(settings.zoomLevel + 0.5) },
      { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => setZoom(settings.zoomLevel - 0.5) },
      { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => setZoom(0) },
    );
    Menu.buildFromTemplate(items).popup();
  });

  /* Downloads: show progress on the window/dock */
  mainWindow.webContents.session.on('will-download', (_e, item) => {
    item.once('done', () => mainWindow.setProgressBar(-1));
    item.on('updated', () => {
      if (item.getTotalBytes() > 0) mainWindow.setProgressBar(item.getReceivedBytes() / item.getTotalBytes());
    });
  });
}

function showWindow() {
  if (!mainWindow) return createWindow();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function setZoom(level) {
  settings.zoomLevel = Math.max(-3, Math.min(3, level));
  mainWindow?.webContents.setZoomLevel(settings.zoomLevel);
  persistSettings();
}
function persistSettings() { writeJSON(settingsFile(), settings); }

function iconImage(size = 32) {
  const file = path.join(__dirname, '..', 'assets', `icon-${size}.png`);
  const fallback = path.join(__dirname, '..', 'assets', 'icon.png');
  const img = nativeImage.createFromPath(fs.existsSync(file) ? file : fallback);
  return img.isEmpty() ? undefined : img;
}

/* ------------------------------------------------------------------ */
/* Tray                                                                */
/* ------------------------------------------------------------------ */
function updateTray() {
  if (!tray) return;
  tray.setToolTip(unreadCount > 0 ? `WhatsApp for Linux — ${unreadCount} unread` : 'WhatsApp for Linux');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: unreadCount > 0 ? `Open WhatsApp  (${unreadCount} unread)` : 'Open WhatsApp', click: showWindow },
    { type: 'separator' },
    { label: 'Start on Login', type: 'checkbox', checked: settings.autostart, click: (item) => setAutostart(item.checked) },
    { label: 'Close to Tray', type: 'checkbox', checked: settings.closeToTray, click: (item) => { settings.closeToTray = item.checked; persistSettings(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
  ]));
}

function createTray() {
  const img = iconImage(32);
  if (!img) return; // tray is optional if no icon resource
  tray = new Tray(img.resize({ width: 24, height: 24 }));
  tray.on('click', () => (mainWindow?.isVisible() && mainWindow?.isFocused() ? mainWindow.hide() : showWindow()));
  updateTray();
}

function setAutostart(enabled) {
  settings.autostart = enabled;
  persistSettings();
  // Works for .deb / AppImage installs on Ubuntu (writes ~/.config/autostart)
  try { app.setLoginItemSettings({ openAtLogin: enabled, args: ['--hidden'] }); } catch {}
}

/* ------------------------------------------------------------------ */
/* App menu                                                            */
/* ------------------------------------------------------------------ */
function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'Open WhatsApp', accelerator: 'CmdOrCtrl+O', click: showWindow },
        { type: 'separator' },
        { label: 'Start on Login', type: 'checkbox', checked: settings.autostart, click: (i) => setAutostart(i.checked) },
        { label: 'Close to Tray', type: 'checkbox', checked: settings.closeToTray, click: (i) => { settings.closeToTray = i.checked; persistSettings(); } },
        { label: 'Start Minimized to Tray', type: 'checkbox', checked: settings.startMinimized, click: (i) => { settings.startMinimized = i.checked; persistSettings(); } },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => { isQuitting = true; app.quit(); } },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
        { type: 'separator' },
        { label: 'Spellcheck', type: 'checkbox', checked: settings.spellcheck, click: (i) => { settings.spellcheck = i.checked; persistSettings(); dialog.showMessageBox({ message: 'Restart the app for spellcheck change to take effect.' }); } },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: () => setZoom(settings.zoomLevel + 0.5) },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => setZoom(settings.zoomLevel - 0.5) },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => setZoom(0) },
        { type: 'separator' },
        {
          label: 'Theme',
          submenu: ['system', 'light', 'dark'].map((t) => ({
            label: t[0].toUpperCase() + t.slice(1), type: 'radio', checked: settings.theme === t,
            click: () => { settings.theme = t; nativeTheme.themeSource = t; persistSettings(); },
          })),
        },
        { label: 'Toggle Full Screen', accelerator: 'F11', click: () => mainWindow?.setFullScreen(!mainWindow.isFullScreen()) },
        ...(isDev ? [{ label: 'Developer Tools', accelerator: 'CmdOrCtrl+Shift+I', click: () => mainWindow?.webContents.toggleDevTools() }] : []),
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'WhatsApp Web', click: () => shell.openExternal('https://faq.whatsapp.com/') },
        { label: 'Report an Issue', click: () => shell.openExternal('https://github.com/EngrAbuhena/whatsapp-for-linux/issues') },
        { type: 'separator' },
        {
          label: 'About WhatsApp for Linux',
          click: () => dialog.showMessageBox({
            title: 'About',
            message: 'WhatsApp for Linux',
            detail: `Version ${app.getVersion()}\nUnofficial open-source client. Not affiliated with WhatsApp LLC or Meta.\nYour chats stay between you and WhatsApp — this app adds no servers, tracking, or analytics.`,
          }),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */
app.whenReady().then(() => {
  settings = readJSON(settingsFile(), DEFAULTS);
  windowState = readJSON(windowStateFile(), windowState);

  // Permissions: notifications, camera/mic (calls), clipboard — WhatsApp only
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    const allowed = ['notifications', 'media', 'microphone', 'camera', 'clipboard-sanitized-write', 'fullscreen'];
    callback(allowed.includes(permission) && wc.getURL().startsWith('https://web.whatsapp.com'));
  });
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = CHROME_UA;
    callback({ requestHeaders: details.requestHeaders });
  });

  if (settings.autostart) setAutostart(true);

  createWindow();
  createTray();
  buildMenu();

  if (Notification.isSupported() && isDev) {
    // Smoke signal in dev that native notifications are wired up
    console.log('[whatsapp-for-linux] notifications supported');
  }
});

app.on('before-quit', () => { isQuitting = true; });
app.on('window-all-closed', () => { if (!settings.closeToTray) app.quit(); });
app.on('activate', showWindow);
ipcMain.on('noop', () => {});
