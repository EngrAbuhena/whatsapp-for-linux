# Security Policy

## Supported versions
Only the latest release is supported.

## Reporting a vulnerability
Please do **not** open a public issue for security problems.
Use GitHub's private vulnerability reporting:
**Security → Report a vulnerability** on this repository,
or open a minimal issue asking for a private contact channel.

## Design guarantees
- Connects only to `https://web.whatsapp.com` (other links open in your browser)
- Permissions (camera, mic, notifications, clipboard) granted only to WhatsApp Web
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- No telemetry, analytics, ads, or third-party servers
