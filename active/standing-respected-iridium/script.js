let recorder;

button.onclick = function () {
  // get audio stream from user's mic
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
    })
    .then(function (stream) {
      let options = {};
      if (audioBitsPerSecond.value) {
        options.audioBitsPerSecond = audioBitsPerSecond.value;
      }
      recorder = new MediaRecorder(stream, options);
      recorder.addEventListener("dataavailable", onRecordingReady);
      recorder.start();
      console.log("start");
      setTimeout(() => {
        console.log("stop");
        recorder.stop();
      }, 3000);
    });
};

function onRecordingReady(e) {
  var audio = document.getElementById("audio");
  // e.data contains a blob representing the recording
  audio.src = URL.createObjectURL(e.data);
  audio.play();
}

button2.onclick = function () {
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
    })
    .then(function (stream) {
      recorder = new MediaRecorder(stream, {
        bitsPerSecond: 3000,
      });
      console.log(`recorder.audioBitsPerSecond: ${recorder.audioBitsPerSecond}`);
      console.log(`recorder.videoBitsPerSecond: ${recorder.videoBitsPerSecond}`);
      recorder.addEventListener("dataavailable", onRecordingReady);
      console.log(`recorder.start();`);
      recorder.start();
      console.log(`recorder.audioBitsPerSecond: ${recorder.audioBitsPerSecond}`);
      console.log(`recorder.videoBitsPerSecond: ${recorder.videoBitsPerSecond}`);
      setTimeout(() => {
        console.log("stop");
        recorder.stop();
      }, 3000);
    });
};
