/* ════════════════════════════════════════════════════════════════════
   LUMEN · SERVICE WORKER DU SITE (26/09)
   ════════════════════════════════════════════════════════════════════
   Mémoriser a le sien (memoriser-sw.js), limité à sa page. Celui-ci garde
   sur l'appareil le reste du site : les pages, leurs scripts, la Bible dans
   ses deux traductions, l'outil de connexion et les polices. Les données
   (articles, ressources, notes) sont gardées de leur côté par Firebase,
   qui conserve sur l'appareil tout ce qui a déjà été lu.

   Trois façons de servir :
   · LES PAGES : le réseau d'abord, pour être toujours à jour ; hors ligne,
     la dernière version gardée.
   · LA BIBLE : l'appareil d'abord, sans rien redemander au serveur. Le
     cache de la Bible porte l'empreinte de son texte : quand une mise en
     ligne change la traduction, l'empreinte change et l'ancien cache part.
   · LE RESTE (scripts versionnés, outil de connexion, polices, icônes) :
     l'appareil d'abord, avec une mise à jour discrète en arrière-plan.

   Le build remplace __SITE_V__ et __BIBLE_V__ par les empreintes du site et
   de la Bible. Une réponse qui n'est pas la bonne (la porte à mot de passe,
   une erreur, un portail Wi-Fi) n'est jamais gardée.
   ════════════════════════════════════════════════════════════════════ */
'use strict';
var SITE = 'lv-site-__SITE_V__';
var BIBLE = 'lv-bible-__BIBLE_V__';
var PAGES = ['/', '/index.html', '/bible.html', '/articles.html', '/ressources.html', '/commentaires.html'];

self.addEventListener('install', function (e) { e.waitUntil(self.skipWaiting()); });

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) {
        return (k.indexOf('lv-site-') === 0 && k !== SITE) || (k.indexOf('lv-bible-') === 0 && k !== BIBLE);
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function genre(url, req) {
  if (url.origin === self.location.origin) {
    var p = url.pathname;
    if (p.indexOf('/memoriser') === 0 || p.indexOf('/__') === 0) return '';
    if (req.mode === 'navigate' || PAGES.indexOf(p) >= 0) return 'page';
    if (p.indexOf('/bible-data/') === 0 || p.indexOf('/bible-data-seraphin/') === 0) return 'bible';
    if (p.indexOf('/js/') === 0 || p === '/lumen-app.js' || p === '/bible-panneau.js' ||
        p === '/recherche-fr.js' || p.indexOf('/icones/') === 0 || p === '/manifest.webmanifest') return 'fixe';
    return '';
  }
  if (url.host === 'www.gstatic.com' && url.pathname.indexOf('/firebasejs/') === 0) return 'fixe';
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') return 'fixe';
  return '';
}

function bonne(r, g) {
  if (!r) return false;
  if (r.type === 'opaque') return g === 'fixe';
  if (!r.ok || r.redirected) return false;
  var t = r.headers.get('content-type') || '';
  if (g === 'page') return /text\/html/.test(t);
  if (g === 'bible') return /json/.test(t);
  return !/text\/html/.test(t);
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (_) { return; }
  var g = genre(url, req);
  if (!g) return;
  var nomCache = g === 'bible' ? BIBLE : SITE;
  /* une page s'enregistre sans ses paramètres, et « / » vaut « /index.html » */
  var cle = g === 'page' ? (url.pathname === '/' ? '/index.html' : url.pathname) : req;

  var travail = caches.open(nomCache).then(function (c) {
    return c.match(cle).then(function (enCache) {
      var aller = function () {
        return fetch(req).then(function (r) {
          if (bonne(r, g)) return c.put(cle, r.clone()).then(function () { return r; }, function () { return r; });
          return r;
        }).catch(function () { return enCache; });
      };
      var fin, fond;
      if (g === 'page') {
        /* hors ligne ou serveur en panne : la dernière version gardée ; la
           porte à mot de passe, elle, passe toujours (jamais remplacée par
           une page gardée) */
        fond = aller();
        fin = fond.then(function (r) { return (!r || r.status >= 500) ? (enCache || r) : r; });
      } else if (enCache) {
        fin = Promise.resolve(enCache);
        /* la Bible gardée ne se redemande pas : seule une nouvelle empreinte
           la renouvelle ; le reste se met à jour en arrière-plan */
        fond = g === 'bible' ? Promise.resolve() : aller();
      } else {
        fond = aller(); fin = fond;
      }
      return { fin: fin.then(function (r) { return r || Response.error(); }), fond: fond };
    });
  });
  e.respondWith(travail.then(function (t) { return t.fin; }));
  e.waitUntil(travail.then(function (t) { return t.fond; }).catch(function () {}));
});
