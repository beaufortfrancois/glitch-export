const context = canvas.getContext("2d");

function drawCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = 48 * devicePixelRatio;
  context.rect(0, 0, canvas.width, canvas.height);
  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "cyan");
  gradient.addColorStop(0.2, "blue");
  gradient.addColorStop(0.4, "magenta");
  gradient.addColorStop(0.6, "red");
  gradient.addColorStop(0.8, "green");
  gradient.addColorStop(1, "yellow");
  context.fillStyle = gradient;
  context.fill();
  context.font = `italic ${16 *
    devicePixelRatio}px Google Sans, Arial, sans-serif`;
  context.fillStyle = "white";
  context.textAlign = "center";
  context.fillText(
    "Pick a color to change CSS accent-color",
    canvas.width / 2,
    canvas.height - 16 * devicePixelRatio
  );
}

function pickColor(event) {
  const x = event.offsetX * devicePixelRatio;
  const y = event.offsetY * devicePixelRatio;
  const p = context.getImageData(x, y, 1, 1).data;
  document.body.style.accentColor = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
}

if (document.createElement("detect").style.accentColor === "") {
  drawCanvas();
  window.onresize = drawCanvas;
  canvas.onclick = pickColor;
} else {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = 48 * devicePixelRatio;
  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "red";
  context.fill();
  context.fillStyle = "white";
  context.font = `italic ${16 *
    devicePixelRatio}px Google Sans, Arial, sans-serif`;
  context.textAlign = "center";
  context.fillText(
    "CSS accent-color is not supported in this browser yet",
    canvas.width / 2,
    canvas.height - 16 * devicePixelRatio
  );
  
}
