/* Taskmaster PEAK 26 PWA v15: network-first so fixes propagate. */
const CACHE='peak26-shell-v17';
const ASSETS=['./','./index.html','./live.js','./music.js','./live-config.js','./live.css','./styles.css','./data.js','./games.js','./manifest.webmanifest','./assets/icon.svg'];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => event.waitUntil(
  Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('peak26-shell-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ])
));
self.addEventListener('fetch', event => {
  const u=new URL(event.request.url);
  if(event.request.method !== 'GET' || u.origin !== self.location.origin) return;
  // Never serve outdated app HTML/JS from HTTP caches when online.
  const fresh=event.request.mode==='navigate'||/\.(?:html|js|css)$/.test(u.pathname);
  event.respondWith(fetch(event.request, fresh ? {cache:'no-store'} : undefined)
    .catch(()=>caches.match(event.request)));
});