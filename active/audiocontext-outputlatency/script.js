let outputLatencies = [];

startButton.onclick = () => {
  startButton.disabled = true;
  const audioContext = new AudioContext();
  (function getAudioContextOutputLatency() {
    if (audioContext.outputLatency) {
      outputLatency.textContent = `${Math.round(
        audioContext.outputLatency * 1000
      )}ms`;
      outputLatencies.push(audioContext.outputLatency * 1000 || 0);
    } else {
      outputLatency.textContent = "N/A";
    }
    timestamp.textContent = `${new Date().toISOString()}`;
    window.requestAnimationFrame(getAudioContextOutputLatency);
  })();
};

requestMicrophoneButton.onclick = () => {
  navigator.mediaDevices.getUserMedia({audio: true});
}

(function draw() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  outputLatencies
    .filter((_, index) => outputLatencies.length - index < canvas.width)
    .forEach((outputLatency, index) => {
      const x = index;
      const y = canvas.height;
      const w = 1 * devicePixelRatio;
      const h = -Math.abs(outputLatency) * devicePixelRatio;
      const context = canvas.getContext("2d");
      context.fillStyle = "#E6007E";
      context.fillRect(x, y, w, h);
    });
  requestAnimationFrame(draw);
})();
