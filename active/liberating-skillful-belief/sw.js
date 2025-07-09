self.addEventListener('fetch', (ev) => {
  console.log(`${ev}`);
  console.log(`${ev.request.url} "${ev.request.destination}"`);
});
