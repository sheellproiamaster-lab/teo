const CACHE = "teo-v3";
const PRECACHE = ["/manifest.json", "/teo-avatar.jpeg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return;
  if (e.request.url.includes("/auth")) return;
  if (e.request.url.includes("/chat")) return;
  if (e.request.url.includes("/aprender")) return;
  if (e.request.url.includes("/parceiros")) return;
});