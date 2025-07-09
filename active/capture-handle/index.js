let captureHandle;

captureButton.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia();
  document.getElementById("video").srcObject = stream;
  const [videoTrack] = stream.getVideoTracks();
  captureHandle = videoTrack.getCaptureHandle();
  updateCaptureHandleText();
  videoTrack.oncapturehandlechange = (event) => {
    captureHandle = event.target.getCaptureHandle();
    updateCaptureHandleText();
  };
};

openButton.onclick = () => window.open("captured.html");
previousButton.onclick = () => sendInstruction("prev");
nextButton.onclick = () => sendInstruction("next");

const broadcastChannel = new BroadcastChannel("capture-handle");

function sendInstruction(direction) {
  if (!captureHandle) return;

  broadcastChannel.postMessage({
    handle: captureHandle.handle,
    direction,
  });
}

function updateCaptureHandleText() {
  document.getElementById("captureHandle").textContent = captureHandle
    ? `Sharing ${captureHandle.origin} content with handle ${captureHandle.handle}`
    : "Try sharing a tab that exposes information to capturing applications instead.";
}
