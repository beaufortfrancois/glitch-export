const context = canvas.getContext("2d", {
  colorSpace: "rec2100-pq",
});

const imageData = new ImageData(canvas.width, canvas.height, {
  colorSpace: "rec2100-pq",
  pixelFormat: "float16",
});

imageData.data.fill(255);
context.putImageData(imageData, 0, 0);
