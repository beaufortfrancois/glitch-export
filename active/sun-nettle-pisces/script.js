let recordedChunks = [];

(async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true,
  });
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: "video/webm",
  });
  mediaRecorder.start();

  mediaRecorder.ondataavailable = (event) => {
    console.log("data-available");
    recordedChunks.push(event.data);
  };

  setTimeout((event) => {
    console.log("stopping");
    mediaRecorder.stop();
  }, 9000);
})();

function download() {
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "test.webm";
  a.click();
  window.URL.revokeObjectURL(url);
}
