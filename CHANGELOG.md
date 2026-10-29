# Changelog
All notable changes follow [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [1.0.2] - 2026-10-29
### Fixed
- **Crash on launch** (`FATAL:zygote_host_impl_linux.cc` / `failed to execvp: /opt/WhatsApp`):
  install directory renamed from `/opt/WhatsApp for Linux/` (spaces broke Chromium's
  sandbox re-exec) to `/opt/WhatsApp-for-Linux/`.

## [1.0.1] - 2026-10-29
### Fixed
- `.deb` now creates the `whatsapp-for-linux` command in `/usr/bin` via `postinst`
  (v1.0.0 only installed the desktop launcher).

## [1.0.0] - 2026-10-29
### Added
- Electron client for WhatsApp Web with system tray, unread dock badge, native
  notifications, voice/video call permissions, close-to-tray, autostart,
  start-minimized, spellcheck, zoom persistence, dark/light/system theme,
  download progress, single-instance, window-state persistence.
- Packaging: .deb, AppImage, Snap (`snap/snapcraft.yaml`), Flatpak manifest.
- GitHub Actions workflow building packages on version tags.
