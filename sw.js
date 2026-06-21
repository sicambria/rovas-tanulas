/* Simple offline-cache service worker. The whole game consists of a few static
 * files, so after the first load it runs without an internet connection. */
var CACHE = 'rovas-v40';
var ASSETS = [
  '.', 'index.html',
  'css/styles.css',
  'js/glyphs.js', 'js/glyph-outlines.js', 'js/glyph-balanced.js', 'js/words.js', 'js/srs.js', 'js/data.js', 'js/core.js',
  'js/strings/hu.js',
  'js/i18n.js',
  'js/glyph-templates-extra.js',
  'js/recognizer.js', 'js/users.js', 'js/draw.js', 'js/ui.js', 'js/music.js',
  'manifest.webmanifest', 'assets/icon.svg', 'rovas.webp',
  'assets/relics/szarvas.jpg', 'assets/relics/marsigli.jpg', 'assets/relics/vargyas.jpg',
  'assets/relics/nikolsburg.jpg', 'assets/relics/csikszentmarton.jpg',
  'assets/relics/konstantinapoly.jpg', 'assets/relics/enlaka.jpg',
  'assets/relics/magyar-adorjan.jpg'
];
/* The music files (music/*.mp3, *.ogg) are intentionally NOT listed here: they
 * would be ~47 MB on first install. Instead, the fetch handler below caches them
 * at runtime — after the first playback they also play offline. */

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { try { c.put(e.request, copy); } catch (x) {} });
        return res;
      }).catch(function () { return caches.match('index.html'); });
    })
  );
});
