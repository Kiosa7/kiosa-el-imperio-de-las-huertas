/* Service worker de Kiosa: el imperio de las huertas.
   El HTML va primero por red (para que un cambio se vea en la misma visita,
   no una visita después) con la caché como respaldo sin conexión; el resto
   de los archivos propios sigue siendo cache-first. Al cambiar CACHE se
   invalidan todos los cachés anteriores. */
const CACHE = 'kiosa-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll falla entero si un archivo no existe todavía (los PNG se
      // generan con iconos.html), así que se guarda uno por uno.
      .then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  const esHTML = req.mode === 'navigate' || req.destination === 'document';
  if (esHTML) {
    // Red primero: así un despliegue nuevo se ve en la misma visita. Si no
    // hay conexión, cae a lo que haya en caché.
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) {
        // refresca en segundo plano para la próxima visita
        fetch(req).then(res => {
          if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
        }).catch(() => {});
        return hit;
      }
      return fetch(req).then(res => {
        if (res && res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
