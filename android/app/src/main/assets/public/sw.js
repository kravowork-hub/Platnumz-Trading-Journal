/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b1bafff1'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "e563df9160c12ae1c4f7ebe9306cfc5c"
  }, {
    "url": "pwa-512x512.png",
    "revision": "2e681846e847610949d447740a6922a8"
  }, {
    "url": "pwa-192x192.png",
    "revision": "a46f0b767ba72fccbaa4b2de5204a7f8"
  }, {
    "url": "index.html",
    "revision": "4f37c5ed7ca2ec129061095d4ae9ea20"
  }, {
    "url": "icon.svg",
    "revision": "b8ba81ece71b59cbb0fb0a5a63717f19"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "1aae827fc38a4f889f1c234b1d6341bc"
  }, {
    "url": "assets/web-YrNm0_0v.js",
    "revision": null
  }, {
    "url": "assets/web-68EZjYIe.js",
    "revision": null
  }, {
    "url": "assets/index-CzxYSDn2.js",
    "revision": null
  }, {
    "url": "assets/index-CwQnDVJm.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "1aae827fc38a4f889f1c234b1d6341bc"
  }, {
    "url": "icon.svg",
    "revision": "b8ba81ece71b59cbb0fb0a5a63717f19"
  }, {
    "url": "pwa-192x192.png",
    "revision": "a46f0b767ba72fccbaa4b2de5204a7f8"
  }, {
    "url": "pwa-512x512.png",
    "revision": "2e681846e847610949d447740a6922a8"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "e563df9160c12ae1c4f7ebe9306cfc5c"
  }, {
    "url": "manifest.webmanifest",
    "revision": "3687940bb6aa901951a022f099a7811b"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-stylesheets-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-webfonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 30,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i, new workbox.StaleWhileRevalidate({
    "cacheName": "local-images-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
