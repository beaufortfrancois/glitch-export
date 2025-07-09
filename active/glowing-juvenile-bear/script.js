button.onclick = async () => {
  if (!("videoTracks" in HTMLMediaElement.prototype)) {
    console.log("Enable experimental web platform features flag in Chrome");
    console.log("Enable media.track.enabled preference in Firefox.");
    return;
  }

  const stream1 = await navigator.mediaDevices.getDisplayMedia();
  const stream2 = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  const tracks = [...stream1.getTracks(), ...stream2.getTracks()];
  console.log("Tracks to add to stream: ", tracks);

  const stream = new MediaStream(tracks);
  console.log("Tracks on stream:", stream.getTracks());

  const video = document.createElement("video");
  video.srcObject = stream;
  await video.play();
  console.log("Tracks on video element:", video.videoTracks, video.audioTracks);
};
