# Flatpak

```bash
npm install
npx electron-builder --linux dir        # produces release/linux-unpacked
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak-builder --install-deps-from=flathub --force-clean build-dir flatpak/io.github.whatsapp_for_linux.yml
flatpak build-bundle repo whatsapp-for-linux.flatpak io.github.whatsapp_for_linux
flatpak install ./whatsapp-for-linux.flatpak
```

For Flathub submission, replace the local `dir` source with the published
GitHub Release tarball + sha256 in the manifest.
