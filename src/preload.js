// Preload: runs isolated. WhatsApp Web needs almost no bridge —
// we keep the surface minimal for security.
// Future features (custom themes, badge helpers) can expose a
// narrow API here via contextBridge. Intentionally empty for v1:
// contextIsolation stays ON and nodeIntegration stays OFF.
'use strict';
