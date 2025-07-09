addEventListener('message', (event) => {
  if (event.data.action === 'broadcast') {
    event.waitUntil((async () => {
      for (const client of await clients.matchAll({ includeUncontrolled: true })) {
        client.postMessage(event.data.message);
      }
    })());
  }
});