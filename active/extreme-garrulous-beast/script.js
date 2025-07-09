navigator.mediaDevices
  .getDisplayMedia({ video: true /*{ cursor: "never" }*/ })
  .then(async stream => {
    video.srcObject = stream;
    const [videoTrack] = stream.getVideoTracks();
    console.log(videoTrack.getSettings().cursor);
    await videoTrack.applyConstraints({ cursor: "never" });
    console.log(videoTrack.getSettings().cursor);
  });

console.log(navigator.mediaDevices.getSupportedConstraints());