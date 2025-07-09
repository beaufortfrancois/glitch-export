const socket = io();
const mimeType = 'video/webm; codecs=vp9,opus';

/* Recording */

let stream;

// User clicks on video to enter Picture-in-Picture and record display and microphone.
video.addEventListener('click', onVideoFirstClick);

async function onVideoFirstClick() {
  const pipVideo = document.createElement('video');
  pipVideo.autoplay = true;
  pipVideo.muted = true;
  pipVideo.srcObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  pipVideo.play(); // because of muted... ;(
  // Requires User Activation V2 (chrome://flags/#user-activation-v2)
  pipVideo.onloadedmetadata = _ => pipVideo.requestPictureInPicture();

  // const screenVideoStream = await navigator.getDisplayMedia({ video: true });
  const screenVideoStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const voiceAudioStream  = await navigator.mediaDevices.getUserMedia({ audio: true });

  stream = new MediaStream([
    ...screenVideoStream.getTracks(),
    ...voiceAudioStream.getTracks()
  ]);
  
  document.body.classList.add('broadcasting');
  video.removeEventListener('click', onVideoFirstClick);
  video.addEventListener('click', onVideoSecondClick, { once: true });
}

async function onVideoSecondClick() {
  // Add 1s delay...
  setTimeout(_ => {
    // Record screen video stream and broadcast stream to server
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    // const mediaRecorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 6000, videoBitsPerSecond: 100000});
    mediaRecorder.start(30 /* timeslice */);
    mediaRecorder.ondataavailable = event => {
      if (event.data.size === 0)
        return;
      socket.emit('broadcast', { blob: event.data });
    }
  }, 1000); 
}


/* Playback video */

let chunks = [];

// Receive video stream from server and play it back.
const mediaSource = new MediaSource();
video.src = URL.createObjectURL(mediaSource);
mediaSource.onsourceopen = _ => {
  const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

  socket.on('playback', event => {
    chunks.push(event.blob);
    appendBuffer();

    // Add controls to unmute video.
    if (!document.pictureInPictureElement && !video.controls) {
      video.addEventListener('playing', _ => { video.controls = true }, { once : true }  );
    }
    document.body.classList.add('playing');
    video.removeEventListener('click', onVideoFirstClick);
  });

  function appendBuffer() {
    if (sourceBuffer.updating || chunks.length === 0)
      return;

    sourceBuffer.appendBuffer(chunks.shift());
    sourceBuffer.addEventListener('updateend', appendBuffer, { once: true });
  }
}