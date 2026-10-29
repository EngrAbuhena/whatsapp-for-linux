# Contributing

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. `npm install && npm start` to develop.
3. Keep `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
4. Never add tracking/analytics. Only network target is `web.whatsapp.com`.
5. Run `npm run lint` before opening a PR.
6. Describe the change and how you tested it on Ubuntu.

## Releasing
Tag `vX.Y.Z` and push — GitHub Actions builds .deb, AppImage and Snap
and attaches them to a GitHub Release.
