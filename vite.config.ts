import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Defensive shim for Vite 8 environment.hot / server.ws when HMR is disabled
const dummyHot = {
  send: () => {},
  on: () => {},
  off: () => {},
  listen: () => {},
  close: () => {},
  accept: () => {},
  dispose: () => {},
  prune: () => {},
  invalidate: () => {},
  data: {},
};

function hotShimPlugin(): Plugin {
  return {
    name: 'safe-hot-shim',
    enforce: 'pre',
    configureServer(server: any) {
      if (!server.ws) server.ws = dummyHot;
      if (!server.hot) server.hot = dummyHot;
      if (server.environments) {
        for (const env of Object.values(server.environments)) {
          if (env && !(env as any).hot) {
            (env as any).hot = dummyHot;
          }
        }
      }
    },
    transform() {
      if ((this as any).environment && !(this as any).environment.hot) {
        (this as any).environment.hot = dummyHot;
      }
    },
    hotUpdate({ server }: any) {
      if ((this as any).environment && !(this as any).environment.hot) {
        (this as any).environment.hot = dummyHot;
      }
      if (server) {
        if (!server.ws) server.ws = dummyHot;
        if (!server.hot) server.hot = dummyHot;
        if (server.environments) {
          for (const env of Object.values(server.environments)) {
            if (env && !(env as any).hot) {
              (env as any).hot = dummyHot;
            }
          }
        }
      }
    },
  };
}

export default defineConfig(({ command }) => {
  return {
    plugins: [
      hotShimPlugin(),
      react(),
      tailwindcss(),
      // Only generate Workbox service worker and build assets during production build
      ...(command === 'build'
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              injectRegister: 'auto',
              includeAssets: [
                'icon.svg',
                'apple-touch-icon.png',
                'pwa-192x192.png',
                'pwa-512x512.png',
                'pwa-maskable-512x512.png',
              ],
              manifest: {
                id: '/',
                name: 'Kravo Trading Journal',
                short_name: 'Kravo',
                description: 'Professional Android trading journal and performance analytics terminal.',
                theme_color: '#090B10',
                background_color: '#090B10',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                scope: '/',
                icons: [
                  {
                    src: '/pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: '/pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: '/pwa-maskable-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                  {
                    src: '/icon.svg',
                    sizes: '192x192 512x512',
                    type: 'image/svg+xml',
                    purpose: 'any',
                  },
                ],
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true,
                navigateFallback: '/index.html',
                runtimeCaching: [
                  {
                    urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'google-fonts-stylesheets-cache',
                      expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                  {
                    urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'google-fonts-webfonts-cache',
                      expiration: {
                        maxEntries: 30,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                  {
                    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
                    handler: 'StaleWhileRevalidate',
                    options: {
                      cacheName: 'local-images-cache',
                      expiration: {
                        maxEntries: 60,
                        maxAgeSeconds: 60 * 60 * 24 * 30,
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                ],
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
