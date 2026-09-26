/* Lumen Veritatis — service worker du Mémoriseur.
   Met en cache la coquille de l'application (page, manifest, icônes,
   scripts Firebase, polices) pour un usage hors ligne. Ne touche à
   AUCUNE autre partie du site, ni aux API Firebase (auth, Firestore). */
'use strict';
/* Le nom du cache et la version du panneau biblique sont posés PAR LE BUILD
   (« __VERSION__ » et « __PAN_V__ » remplacés dans build-bi.js) : à chaque
   changement de contenu, le cache change de nom et l'ancien est effacé. Il
   n'y a plus de « v3 » à penser à incrémenter à la main (05/09). */
var CACHE = 'lv-memoriser-__VERSION__';
var PAN_V = '__PAN_V__';
var COQUILLE = [
  '/memoriser.html',
  '/memoriser-manifest.webmanifest',
  '/icones/memoriser-192.png',
  '/icones/memoriser-512.png',
  '/icones/memoriser-180.png',
  '/icones/memoriser-512-maskable.png',
  /* le sélecteur « Choisir dans la Bible » de Mémoriser en dépend : sans
     eux, l'application installée affichait hors ligne « la Bible n'est pas
     encore prête » pour toujours (05/09) */
  '/bible-panneau.js?v=' + PAN_V,
  '/bible-data/index.json',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(COQUILLE.map(function (u) {
        /* un fichier LOCAL qui manque fait échouer l'installation : mieux
           vaut un ancien worker qui marche qu'un nouveau installé « avec
           succès » et une application cassée hors ligne ; les fichiers
           tiers, eux, peuvent manquer sans drame */
        return c.add(u).catch(function (err) { if (u.charAt(0) === '/') throw err; });
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
        || url.pathname === '/bible-panneau.js'
        || url.pathname.indexOf('/bible-data/') === 0
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
  /* La page est rangée sous UNE clé, sans paramètres : l'accueil y envoie
     avec « ?demarrer=1 », et cette variante ne correspondait à rien dans le
     cache (hors ligne : erreur au lieu de la page). */
  var page = (url.origin === self.location.origin && url.pathname === '/memoriser.html');
  var cle = page ? '/memoriser.html' : e.request;
  /* Deux promesses posées AU MOMENT DE L'ÉVÉNEMENT : la réponse à rendre, et
     la mise à jour en arrière-plan, RETENUE par waitUntil. Sans cela le
     navigateur pouvait arrêter le worker avant l'écriture en cache, et une
     icône ou un manifeste changé restait périmé chez qui avait installé
     l'application (05/09). */
  var travail = caches.open(CACHE).then(function (c) {
    /* la page ignore ses paramètres (« ?demarrer=1 ») ; les fichiers versionnés
       (« ?v=… »), eux, ne doivent JAMAIS être confondus avec une version antérieure */
    return c.match(cle, page ? { ignoreSearch: true } : undefined).then(function (enCache) {
      var reseau = fetch(e.request).then(function (r) {
        /* pour la page, on n'accepte en cache qu'une VRAIE page du site : un
           portail Wi-Fi qui répond « 200 » avec sa propre page d'accueil ne
           doit pas devenir notre page hors ligne (05/09) */
        var ok = r && (r.ok || r.type === 'opaque');
        if (ok && page) ok = r.type === 'basic' && /text\/html/.test(r.headers.get('content-type') || '');
        if (ok) return c.put(cle, r.clone()).then(function () { return r; }, function () { return r; });
        return r;
      }).catch(function () { return enCache; });
      /* la page elle-même : réseau d'abord (fraîcheur), cache en secours ;
         le reste : cache d'abord, mise à jour en arrière-plan */
      var fin = page ? reseau.then(function (r) { return r || enCache; }) : Promise.resolve(enCache || reseau);
      /* jamais « undefined » : le navigateur exige une vraie réponse */
      return { fin: fin.then(function (r) { return r || Response.error(); }), reseau: reseau };
    });
  });
  e.respondWith(travail.then(function (t) { return t.fin; }));
  e.waitUntil(travail.then(function (t) { return t.reseau; }).catch(function () {}));
});
