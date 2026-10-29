# 🚀 Upload this project to GitHub (5 minutes)

> Maintainer guide for **EngrAbuhena** — username is already set everywhere.
> You can delete this file after uploading if you like.

Your repo will be: **https://github.com/EngrAbuhena/whatsapp-for-linux**

## Step 1 — Create the empty repo on GitHub
1. Go to https://github.com/new
2. Owner: `EngrAbuhena` · Repository name: `whatsapp-for-linux`
3. Description: `Unofficial open-source WhatsApp Desktop client for Ubuntu & Linux — tray, unread badge, notifications, calls. No tracking.`
4. **Public** · ❌ Do NOT tick "Add a README" / ".gitignore" / "license" (this project already has them)
5. Click **Create repository**

## Step 2 — Push this code
```bash
cd whatsapp-for-linux
git remote add origin https://github.com/EngrAbuhena/whatsapp-for-linux.git
git branch -M main
git push -u origin main
git push origin v1.0.2
```

If Git asks you to log in, use a Personal Access Token as the password
(GitHub → Settings → Developer settings → Personal access tokens),
or run `gh auth login` if you have GitHub CLI installed.


## Step 3 — Your first Release (packages people can download)
Pushing the `v1.0.2` tag above triggers GitHub Actions
(`.github/workflows/build.yml`), which automatically builds the
**.deb** and **AppImage** and attaches them to a Release:
`https://github.com/EngrAbuhena/whatsapp-for-linux/releases`

Or upload manually: Releases → Draft a new release → tag `v1.0.2` →
attach `release/whatsapp-for-linux_1.0.2_amd64.deb` and
`release/WhatsApp-for-Linux-1.0.2.AppImage`.

## Step 4 — Make the repo look alive (2 minutes)
- Repo **About** (⚙️ gear on the repo home): description + topics:
  `whatsapp`, `linux`, `ubuntu`, `electron`, `desktop-app`, `whatsapp-web`, `open-source`
- Replace `docs/screenshot-placeholder.png` with a real screenshot of the
  app (blur contact names!) — update the path in README if you rename it.
- Pin the repo on your profile if you want it discovered.

## ⚠️ Trademark note
This is an **unofficial** client. Keep the disclaimer in the README,
never use WhatsApp's official logo as your own branding, and don't
claim affiliation with WhatsApp LLC / Meta.

## Updating later
```bash
# change code, then:
npm version patch        # bumps version, creates a new tag
git push && git push --tags   # Actions builds the new release
```
