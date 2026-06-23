/**
 * 友愛教室 V2 — sw-register.js
 * PWA install prompt + service worker update handling
 *
 * Usage:
 *   import './sw-register.js';  // call once in main.js
 */

// ── Install Prompt ──────────────────────────────────────────────────────────
let deferredPrompt = null;
let installBtn = null;

// Show install banner when browser fires beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

function showInstallBanner() {
  // Remove any existing banner
  const existing = document.getElementById('pwa-install-banner');
  if (existing) existing.remove();

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #7B2FBE, #5B1F9E);
    color: white;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    font-size: var(--fs-base);
    box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
    animation: slideUp 0.3s ease-out;
  `;
  banner.innerHTML = `
    <span style="font-size:1.4em">📱</span>
    <span style="flex:1">將應用加入主畫面，離線都能用！</span>
    <button id="pwa-install-btn" style="
      background: white;
      color: #7B2FBE;
      border: none;
      border-radius: 20px;
      padding: 8px 18px;
      font-weight: 600;
      cursor: pointer;
      font-size: var(--fs-sm);
    ">安裝</button>
    <button id="pwa-install-close" style="
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-size: var(--fs-base);
      line-height: 1;
    ">✕</button>
  `;

  document.body.appendChild(banner);

  banner.querySelector('#pwa-install-btn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    banner.remove();
    if (outcome === 'accepted') {
      // Installed! Hide any update prompt
      const upd = document.getElementById('pwa-update-banner');
      if (upd) upd.remove();
    }
  });

  banner.querySelector('#pwa-install-close').addEventListener('click', () => {
    banner.remove();
    // Remember user dismissed — don't show again for this session
    sessionStorage.setItem('fc_install_dismissed', '1');
  });
}

// Don't re-show install prompt if user already dismissed this session
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('fc_install_dismissed')) return;
  // If already in standalone mode, skip
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  // If no deferredPrompt yet, wait — browser fires it on user interaction
});

// ── Update Prompt (new SW available) ─────────────────────────────────────────
let swUpdateReady = false;

if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() {
        showUpdateBanner();
      },
      onOfflineReady() {
        // Show brief "ready for offline" toast
        showOfflineReadyToast();
      },
    });
  }).catch(() => {
    // virtual:pwa-register only works in production build
    // Dev mode: skip
  });
}

function showUpdateBanner() {
  const existing = document.getElementById('pwa-update-banner');
  if (existing) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-update-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #faad14, #e67e00);
    color: white;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    font-size: var(--fs-base);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease-out;
  `;
  banner.innerHTML = `
    <span style="font-size:1.2em">🔄</span>
    <span style="flex:1">有新版本可用</span>
    <button id="pwa-reload-btn" style="
      background: white;
      color: #e67e00;
      border: none;
      border-radius: 20px;
      padding: 7px 16px;
      font-weight: 600;
      cursor: pointer;
      font-size: var(--fs-sm);
    ">重新載入</button>
    <button id="pwa-update-close" style="
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-size: var(--fs-base);
      line-height: 1;
    ">✕</button>
  `;

  document.body.appendChild(banner);

  banner.querySelector('#pwa-reload-btn').addEventListener('click', () => {
    window.location.reload();
  });
  banner.querySelector('#pwa-update-close').addEventListener('click', () => {
    banner.remove();
  });
}

function showOfflineReadyToast() {
  const existing = document.getElementById('pwa-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'pwa-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #15803d;
    color: #ffffff;
    padding: 10px 20px;
    border-radius: 24px;
    font-size: var(--fs-sm);
    font-weight: 600;
    z-index: 9999;
    animation: fadeInUp 0.3s ease-out;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  `;
  toast.textContent = '✅ 已準備好離線使用';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── CSS animations ────────────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
@keyframes fadeInUp {
  from { transform: translateX(-50%) translateY(20px); opacity: 0; }
  to   { transform: translateX(-50%) translateY(0);      opacity: 1; }
}
`;
document.head.appendChild(style);