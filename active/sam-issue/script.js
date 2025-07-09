regularAudio.src =
  "https://storage.googleapis.com/media-session/sintel/snow-fight.mp3";

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  microphoneAudio.srcObject = stream;
});

/* Several WebAudio contexts without audio tags */

// (async _ => {
//   for (let i = 0; i < 3; i++) {
//     const response = await fetch(
//       "https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
//     );
//     const arrayBuffer = await response.arrayBuffer();
//     const context = new AudioContext();
//     const source = context.createBufferSource();
//     context.decodeAudioData(arrayBuffer, buffer => {
//       source.buffer = buffer;
//       source.connect(context.destination);
//       source.start(0);
//     });
//   }
// })();

/* Several WebAudio context with audio tags */

// (async _ => {
//   for (let i = 0; i < 3; i++) {
//     const context = new AudioContext();
//     const audio = document.createElement("audio");
//     audio.setAttribute("crossorigin", true);
//     audio.src =
//       "https://storage.googleapis.com/media-session/sintel/snow-fight.mp3";

//     const source = context.createMediaElementSource(audio);
//     source.connect(context.destination);
//     audio.play();
//   }
// })();

// const audio = document.createElement("audio");
// audio.setAttribute("crossorigin", true);
// audio.src =
//   "https://storage.googleapis.com/media-session/sintel/snow-fight.mp3";
// audio.controls = true;
// document.body.appendChild(audio);

// const infinityVideo = document.createElement("video");
// const mediaSource = new MediaSource();
// infinityVideo.src = URL.createObjectURL(mediaSource);
// infinityVideo.controls = true;
// document.body.appendChild(infinityVideo);

// mediaSource.addEventListener("sourceopen", async () => {
//   mediaSource.addSourceBuffer('video/webm; codecs="vp9"');
//   const videoUrl = "https://storage.googleapis.com/media-session/sample.webm";
//   const sourceBuffer = mediaSource.sourceBuffers[0];

//   const response = await fetch(videoUrl, { headers: { range: "bytes=0-567139" } });
//   const data = await response.arrayBuffer();
//   sourceBuffer.appendBuffer(data);
//   sourceBuffer.onupdateend = _ => {
//     mediaSource.duration = +Infinity;
//   };
// });
