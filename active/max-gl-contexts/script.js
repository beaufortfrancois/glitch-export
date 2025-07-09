const numCanvas = 256;

(function createWebGlContext(i) {
  if (i >= numCanvas) return;

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  try {
    const gl = canvas.getContext("webgl");
    gl.clearColor(0, i / numCanvas, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  } catch (error) {}
  setTimeout(() => {
    createWebGlContext(++i);
  }, 0);
})(0);
