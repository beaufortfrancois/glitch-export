addEventListener('install', () => {
  importScripts('./lazy.js');
});

addEventListener('fetch', (event) => {
  importScripts('./lazy.js');
  event.respondWith(self.getLazyResponse());
});