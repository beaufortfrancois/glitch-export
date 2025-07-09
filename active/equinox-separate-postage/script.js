button1.onclick = async function () {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
};

button2.onclick = function () {
  video.pause();
  logBlobSize({ alpha: true });
  logBlobSize({ alpha: false });
};

function logBlobSize({ alpha }) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas
    .getContext("2d", { alpha })
    .drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob((blob) => {
    console.log(
      `PNG Blob size is ${blob.size} bytes with { alpha: ${alpha} } `
    );
  });
  canvas.toBlob((blob) => {
    console.log(
      `JPG Blob size is ${blob.size} bytes with { alpha: ${alpha} } `
    );
  }, "image/jpeg");
  canvas.toBlob((blob) => {
    console.log(
      `WebP Blob size is ${blob.size} bytes with { alpha: ${alpha} } `
    );
  }, "image/webp");
}
