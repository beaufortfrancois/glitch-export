self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  return self.clients.claim();
});

self.addEventListener("fetch", async e => {
  if (e.request.url.endsWith("/?start_url")) {
    e.respondWith(new Response("foo"));
    return;
  }

  if (e.request.url.endsWith("/manifest.json?stripScreenshots")) {
    e.respondWith(
      fetch(e.request).then(async response => {
        const manifestData = await response.json();
        manifestData.screenshots = [];
        return new Response(JSON.stringify(manifestData), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  e.respondWith(fetch(e.request));
});
