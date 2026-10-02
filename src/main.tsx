import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker immediately for Chrome PWA installability and offline-first performance
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
