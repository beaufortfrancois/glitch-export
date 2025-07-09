const btn = document.querySelector("button"); // Get the button from the page
btn.onclick = function () {
  const audioCtx = new AudioContext();

  let n = new OscillatorNode(audioCtx);

  for (let i = 0; i < 100; i++) {
    const gainNode = new GainNode(audioCtx);
    n = n.connect(gainNode);
  }
  n.connect(audioCtx.destination);
};
