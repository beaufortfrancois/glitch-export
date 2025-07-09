(async _ => {
  const canvas = document.createElement("canvas");
  canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
  const stream = canvas.captureStream();

  // const video = document.createElement("video");
  // video.muted = true;
  // video.srcObject = stream;
  // await video.play();

  const imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
  const frame = await imageCapture.grabFrame();
  console.log(frame);
})();
