/* Rounds service worker — precache the app shell + content bundle, cache fonts at runtime. */
const VERSION = '__BUILD__';
const CACHE = 'rounds-' + VERSION;
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('rounds-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // The shell (page, styles, scripts) is network-first so one reload always lands on the current build;
    // cache-first there served the previous build's files forever, because the ?v= hash is ignored on match.
    // Content bundles and icons stay cache-first: they are large and only ever change with the build.
    const shell = req.mode === 'navigate' || (!url.pathname.includes('/content/') && /\.(html|css|js|webmanifest)$/.test(url.pathname));
    const fromCache = () => caches.match(req, { ignoreSearch: true })
      .then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html', { ignoreSearch: true }) : undefined));
    const fromNet = () => fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    });
    if (shell) {
      // Offline should fail over quickly rather than hang on an unreachable tailnet.
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 2500));
      e.respondWith(Promise.race([fromNet(), timeout]).catch(fromCache));
      return;
    }
    e.respondWith(fromCache().then((hit) => hit || fromNet().catch(() => undefined)));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open('rounds-fonts').then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
