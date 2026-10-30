/* DIEMEZ CLEANS — service worker
   Caches the app shell so the site opens and installs like an app.
   Customer records and API responses are never cached. */

const CACHE = "diemez-shell-v3";

const SHELL = [
  "./",
  "index.html",
  "services.html",
  "pricing.html",
  "plans.html",
  "pickup.html",
  "quote.html",
  "contact.html",
  "faq.html",
  "about.html",
  "login.html",
  "register.html",
  "account.html",
  "admin.html",
  "privacy.html",
  "terms.html",
  "refund.html",
  "offline.html",
  "manifest.webmanifest",
  "assets/css/styles.css",
  "assets/js/config.js",
  "assets/js/data.js",
  "assets/js/api.js",
  "assets/js/layout.js",
  "assets/js/catalogue.js",
  "assets/js/booking.js",
  "assets/js/forms.js",
  "assets/js/auth.js",
  "assets/js/account.js",
  "assets/js/admin.js",
  "icons/favicon.svg",
  "icons/icon-192.svg",
  "icons/icon-512.svg",
  "icons/maskable-512.svg",
  "icons/icon-192.png",
  "icons/logo-animated.svg",
  "icons/logo-animated-light.svg",
  "icons/icon-512.png",
  "assets/img/hero.svg",
  "assets/img/wash.svg",
  "assets/img/iron.svg",
  "assets/img/dry.svg",
  "assets/img/cleaning.svg",
  "assets/img/painting.svg",
  "assets/img/delivery.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("offline.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      });
    })
  );
});
