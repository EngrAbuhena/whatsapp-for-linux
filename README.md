# WhatsApp for Linux

> An **unofficial**, open-source WhatsApp Desktop client for Ubuntu & Linux.
> Not affiliated with WhatsApp LLC or Meta. WhatsApp™ is a trademark of WhatsApp LLC.

The WhatsApp desktop experience Linux deserved: a fast Electron wrapper around
WhatsApp Web with the native touches other clients miss — a real system tray,
unread badge on the Ubuntu dock, native notifications, calls, spellcheck,
autostart, and proper download handling. **No extra servers, no tracking,
no analytics** — it connects only to `web.whatsapp.com`, exactly like your browser.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Platform: Ubuntu / Linux](https://img.shields.io/badge/Platform-Ubuntu%20%2F%20Linux-orange.svg)
![Release](https://img.shields.io/github/v/release/EngrAbuhena/whatsapp-for-linux)
![Downloads](https://img.shields.io/github/downloads/EngrAbuhena/whatsapp-for-linux/total)
![Build](https://github.com/EngrAbuhena/whatsapp-for-linux/actions/workflows/build.yml/badge.svg)

## 📸 Screenshot

<!-- Maintainer: replace docs/screenshot-placeholder.png with a real screenshot (blur contact names!) -->
<img src="docs/screenshot-placeholder.png" width="180" alt="App icon — replace with a real screenshot after install" />

## ⬇️ Download

**[➡ Latest release (.deb & AppImage)](https://github.com/EngrAbuhena/whatsapp-for-linux/releases/latest)** — no build needed.

## ✨ Features

| Feature | Status |
|---|---|
| System tray (show/hide, unread count in tooltip, quick toggles) | ✅ |
| Unread badge on Ubuntu dock / launcher (`app.setBadgeCount`) | ✅ |
| Native desktop notifications (from WhatsApp Web) | ✅ |
| Voice & video calls (camera / microphone permissions) | ✅ |
| Close to tray & start minimized (`--hidden` for autostart) | ✅ |
| Start on login (autostart) | ✅ |
| Spellcheck with right-click suggestions | ✅ |
| Zoom In / Out / Reset (`Ctrl` `+` / `-` / `0`), remembered | ✅ |
| Dark / Light / System theme | ✅ |
| Download progress on the window, right-click *Save Image As…* | ✅ |
| External links open in your default browser | ✅ |
| Single-instance, window size/position remembered | ✅ |
| Secure by default (`contextIsolation`, `sandbox`, no Node in page) | ✅ |

## 📦 Install

### .deb (Ubuntu / Debian)
```bash
# Download the .deb from GitHub Releases, then:
sudo apt install ./whatsapp-for-linux_1.0.0_amd64.deb
```

### AppImage (any distro)
```bash
chmod +x WhatsApp-for-Linux-1.0.0.AppImage
./WhatsApp-for-Linux-1.0.0.AppImage
```

### Snap
```bash
sudo snap install whatsapp-for-linux   # after publishing to the Snap Store
# or locally:  snapcraft && sudo snap install --dangerous ./whatsapp-for-linux_1.0.0_amd64.snap
```

### Flatpak
See [`flatpak/README.md`](flatpak/README.md) — `flatpak-builder` manifest included.

## 🚀 Build from source

Requirements: **Node.js 20+** and npm.

```bash
git clone https://github.com/EngrAbuhena/whatsapp-for-linux.git
cd whatsapp-for-linux
npm install
npm start            # run in development
npm run dist:deb       # build .deb
npm run dist:appimage  # build AppImage
npm run dist:snap      # build Snap
npm run dist:all       # .deb + AppImage + Snap -> release/
```

## ⌨️ Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Q` | Quit |
| `Ctrl+R` | Reload |
| `Ctrl+` `+` / `-` / `0` | Zoom in / out / reset |
| `F11` | Full screen |

## 🔒 Privacy & security

- Talks **only** to `web.whatsapp.com` (and opens other links in your browser).
- Permissions (camera, mic, notifications, clipboard) are granted **only** to WhatsApp Web.
- No telemetry, no ads, no injected trackers. Audit it: all the logic is in
  [`src/main.js`](src/main.js) (~350 lines) and [`src/preload.js`](src/preload.js).

## 🗺️ Roadmap

- [ ] Multi-account support
- [ ] Custom CSS / themes
- [ ] Picture-in-picture for calls
- [ ] Flathub & Snap Store publishing
- [ ] Auto-update via GitHub Releases

## 🤝 Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md). Please keep the
no-tracking promise and the secure Electron defaults.

## 📄 License

[MIT](LICENSE) — © WhatsApp for Linux Contributors

> This is an unofficial client that loads WhatsApp Web. Use it in accordance
> with WhatsApp's Terms of Service.
