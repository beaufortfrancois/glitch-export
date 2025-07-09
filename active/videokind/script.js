if ("videoKind" in navigator.mediaDevices.getSupportedConstraints()) {
  getDepthStream();
} else {
  pre.textContent += "videoKind is not supported yet.";
}

async function getDepthStream() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { videoKind: { exact: "depth" } }
  });
  video.srcObject = stream;
}
