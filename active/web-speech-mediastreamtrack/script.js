audioElement.muted = new URL(location).searchParams.has("audioElementMuted");

audioInputButton.onchange = async (event) => {
  const file = event.target.files[0];
  const blob = new Blob([file]);

  // Load audio
  audioElement.src = URL.createObjectURL(blob);
  // Capture media stream...
  const mediaStream = audioElement.captureStream();
  // Wait for audio stream track to be added to media stream...
  await new Promise((r) => (audioElement.onloadeddata = r));
  // Start speech recognition...
  captureSpeech(
    mediaStream,
    audio_statusLogs,
    audio_finalLogs,
    audio_interimLogs
  );
  await audioElement.play();
};

getUserMediaButton.onclick = async () => {
  if (devicesIds.selectedOptions.length === 0) {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    captureSpeech(mediaStream, mic_statusLogs, mic_finalLogs, mic_interimLogs);
    const devices = await navigator.mediaDevices.enumerateDevices();
    for (const device of devices) {
      if (device.kind == "audioinput") {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.innerHTML = device.label;
        devicesIds.appendChild(option);
      }
    }
    return;
  }

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: { exact: devicesIds.selectedOptions[0].value },
    },
  });
  captureSpeech(mediaStream, mic_statusLogs, mic_finalLogs, mic_interimLogs);
};

videoInputButton.onchange = async (event) => {
  const file = event.target.files[0];
  const blob = new Blob([file]);

  // Load video
  videoElement.src = URL.createObjectURL(blob);
  // Capture media stream...
  const mediaStream = videoElement.captureStream();
  // Wait for audio stream track to be added to media stream...
  await new Promise((r) => (videoElement.onloadeddata = r));
  // Start speech recognition...
  captureSpeech(
    mediaStream,
    video_statusLogs,
    video_finalLogs,
    video_interimLogs,
    (interimTranscript) => {
      for (const cue of videoTextTrack.track.cues) {
        videoTextTrack.track.removeCue(cue);
      }
      const endTime = videoElement.currentTime;
      const startTime = 0;
      videoTextTrack.track.addCue(
        new VTTCue(startTime, endTime, interimTranscript)
      );
    }
  );
  await videoElement.play();
};

webAudioInputButton.onchange = async (event) => {
  const file = event.target.files[0];
  const arrayBuffer = await file.arrayBuffer();

  const ac = new AudioContext();
  const bufferSource = ac.createBufferSource();

  const audioBuffer = await ac.decodeAudioData(arrayBuffer);
  bufferSource.buffer = audioBuffer;

  const mediaStreamDestination = ac.createMediaStreamDestination();
  bufferSource.connect(mediaStreamDestination);
  
  // Optional 
  webAudioElement.srcObject = mediaStreamDestination.stream;

  captureSpeech(
    mediaStreamDestination.stream,
    webAudio_statusLogs,
    webAudio_finalLogs,
    webAudio_interimLogs
  );
  
  bufferSource.start();
};

async function captureSpeech(
  mediaStream,
  statusLogs,
  finalLogs,
  interimLogs,
  callback
) {
  // Recognize audio speech...
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  const noAudioTrack = new URL(location).searchParams.has("noAudioTrack");
  if (noAudioTrack) {
    recognition.start();
    recognition.onstart = () => {
      statusLogs.innerHTML = `Speech recognition started`;
    };
  } else {
    const audioTrack = mediaStream.getAudioTracks()[0];
    recognition.start(audioTrack);
    recognition.onstart = () => {
      statusLogs.innerHTML = `Speech recognition started on ${audioTrack.label}`;
    };
  }
  finalLogs.innerHTML = "";
  interimLogs.innerHTML = "";

  let finalTranscript = "";
  recognition.onresult = (event) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    finalLogs.innerHTML = finalTranscript;
    interimLogs.innerHTML = interimTranscript;
    if (callback) {
      callback(interimTranscript);
    }
  };
  recognition.onerror = (event) => {
    recognition.stop();
    statusLogs.innerHTML = `Speech recognition error "${event.error}"`;
  };
}

function isMediaStreamTrackSupported() {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("allow", "microphone 'none'");
  document.body.appendChild(iframe);

  const recognition = new iframe.contentWindow.webkitSpeechRecognition();

  try {
    recognition.start(0);
    result = false;
  } catch (error) {
    result = error.name == "TypeError";
  } finally {
    iframe.remove();
    return result;
  }
}
if (!isMediaStreamTrackSupported()) {
  statusMessage.textContent =
    "Warning! MediaStreamTrack support is not available.";
}
