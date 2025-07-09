const audioElement = document.querySelector("audio");

const inputElement = document.querySelector("input");
inputElement.onchange = async (event) => {
  const file = event.target.files[0];
  const blob = new Blob([file]);
  audioElement.src = URL.createObjectURL(blob);

  // Play and capture audio stream track.
  await audioElement.play();
  const audioStream = document.querySelector("audio").captureStream();
  const audioTrack = audioStream.getAudioTracks()[0];

  // Recognize audio speech.
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  // recognition.lang = "en-US";
  recognition.start(audioTrack);

  recognition.onresult = (event) => {
    const pre = document.querySelector("pre");
    pre.append(event.results[event.resultIndex][0].transcript);
  };

  audioElement.onended = () => {
    recognition.stop();
  };
};
