import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './safe-area.css';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// Native Android system-bar styling. MainActivity exposes WindowInsets as
// CSS variables consumed by safe-area.css.
if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
  try {
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#090B10' }).catch(() => {});
  } catch {}
}

// Register service worker immediately for offline-first native performance
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('Kravo PWA ServiceWorker active:', reg.scope);
      })
      .catch((err) => {
        console.warn('SW register note:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
