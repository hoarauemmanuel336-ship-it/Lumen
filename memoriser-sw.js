/* Lumen Veritatis — service worker du Mémoriseur.
   Met en cache la coquille de l'application (page, manifest, icônes,
   scripts Firebase, polices) pour un usage hors ligne. Ne touche à
   AUCUNE autre partie du site, ni aux API Firebase (auth, Firestore). */
'use strict';
var CACHE = 'lv-memoriser-v1';
var COQUILLE = [
  '/memoriser.html',
  '/memoriser-manifest.webmanifest',
  '/icones/memoriser-192.png',
  '/icones/memoriser-512.png',
  '/icones/memoriser-180.png',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(COQUILLE.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) {
        return k.indexOf('lv-memoriser-') === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function concerne(url) {
  if (url.origin === self.location.origin) {
    return url.pathname === '/memoriser.html'
        || url.pathname === '/memoriser-manifest.webmanifest'
        || url.pathname.indexOf('/icones/') === 0;
  }
  /* scripts Firebase statiques (jamais les API auth/Firestore) */
  if (url.host === 'www.gstatic.com' && url.pathname.indexOf('/firebasejs/') === 0) return true;
  /* polices */
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') return true;
  return false;
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url;
  try { url = new URL(e.request.url); } catch (_) { return; }
  if (!concerne(url)) return;
  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(e.request).then(function (enCache) {
        var reseau = fetch(e.request).then(function (r) {
          if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone());
          return r;
        }).catch(function () { return enCache; });
        /* la page elle-même : réseau d'abord (fraîcheur), cache en secours ;
           le reste : cache d'abord, mise à jour en arrière-plan */
        if (url.pathname === '/memoriser.html') return reseau.then(function (r) { return r || enCache; });
        return enCache || reseau;
      });
    })
  );
});
