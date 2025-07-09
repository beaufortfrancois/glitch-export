setInterval(() => {
  const audio = document.createElement("audio");
  audio.src =
    "https://cdn.glitch.global/9e74f014-eb25-4ef0-b986-16ac59425d75/ping.mp3";
  audio
    .play()
    .then(() => {
      pre.textContent += `Played at ${new Date()}\r\n`;
    })
    .catch((error) => {
      pre.textContent += `Failed to play: ${error}\r\n`;
    });
}, 3000);

window.addEventListener(
  "freeze",
  () => {
    pre.textContent += `freeze event fired!\r\n`;
  },
  { capture: true }
);

window.addEventListener(
  "pagehide",
  (event) => {
    pre.textContent += `pagehide event fired! event.persisted: ${event.persisted}\r\n`;
  },
  { capture: true }
);
