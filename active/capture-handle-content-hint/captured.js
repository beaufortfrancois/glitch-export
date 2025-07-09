// Exposes a random handle and the origin to any capturing web app.
const config = {
  handle: crypto.randomUUID(), // A randomly generated UUID.
  exposeOrigin: true, // Expose own origin.
  permittedOrigins: ["*"], // Observable by any capturing web app.
};
navigator.mediaDevices.setCaptureHandleConfig(config);

const broadcastChannel = new BroadcastChannel("capture-handle");
broadcastChannel.onmessage = async (message) => {
  if (message.data.handle != config.handle) return;

  // Play a sliding animation
  await document.body.animate([{ transform: "translate(-100%)" }], {
    duration: 500,
  }).finished;
  // Then update slide number
  if (message.data.direction == "prev") {
    slideNum.textContent = Math.max(0, parseInt(slideNum.textContent) - 1);
  } else if (message.data.direction == "next") {
    slideNum.textContent = parseInt(slideNum.textContent) + 1;
  }
};

logs.textContent = `navigator.mediaDevices.setCaptureHandleConfig(\r\n${JSON.stringify(
  config
)});`;
