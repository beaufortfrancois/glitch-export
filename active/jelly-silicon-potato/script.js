video.onclick = () => {
  if (video.srcObject) {
    video.srcObject = null;
    video.src =
      "https://upload.wikimedia.org/wikipedia/commons/6/61/2160p_Demo_-_3840x2160_pixel_4k_Video_-_a_timelapse_project_by_Florian_Friedrich.webm";
    video.play();
    return;
  }
  navigator.mediaDevices
    .getUserMedia({
      video: { height: 2160, pan: true, tilt: true, zoom: true }
    })
    .then(async stream => {
      video.src = undefined;
      video.srcObject = stream;
      await video.play();
      pre.textContent = `${stream.getVideoTracks()[0].label} (${
        video.videoWidth
      }x${video.videoHeight})`;
    });
};
let stop = false;

function stopping(callback) {
  stop = true;
  pre.textContent = "";
  setTimeout(() => {
    pre.textContent = "";
    stop = false;
    callback();
  }, 1000);
}

detectImageButton.onclick = () => {
  stopping(() => {
    detect(image);
  });
};
detectVideoButton.onclick = () => {
  stopping(() => {
    detect(video);
  });
};
grabFrameButton.onclick = () => {
  stopping(() => {
    grabFrame();
  });
};
grabFrameAndDetectButton.onclick = () => {
  stopping(() => {
    grabFrameAndDetect();
  });
};
createImageBitmapButton.onclick = () => {
  stopping(() => {
    createImageBitmapVideo();
  });
};
stopButton.onclick = () => {
  stop = true;
}

async function detect(target) {
  if (stop) return;
  const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
  try {
    console.log('await barcodeDetector.detect(target)...');
    const barcodes = await barcodeDetector.detect(target);
    console.log('got barcodes.');
    if (!stop)
      pre.textContent = `[detect(${target.tagName})] ${JSON.stringify(
        barcodes,
        null,
        2
      )}`;
  } catch (error) {
    pre.textContent = error;
  }
  detect(target);
}

async function grabFrame() {
  if (stop) return;
  const [videoTrack] = video.captureStream().getVideoTracks();
  const imageCapture = new ImageCapture(videoTrack);
  try {
    const frame = await imageCapture.grabFrame();
    if (!stop)
      pre.textContent = `[grabFrame()] frame size: ${frame.width}x${frame.height}`;
  } catch (error) {
    pre.textContent = error;
  }
  grabFrame();
}

async function grabFrameAndDetect() {
  if (stop) return;
  const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
  const [videoTrack] = video.captureStream().getVideoTracks();
  const imageCapture = new ImageCapture(videoTrack);
  try {
    const frame = await imageCapture.grabFrame();
    const barcodes = await barcodeDetector.detect(frame);
    if (!stop)
      pre.textContent = `[grabFrameAndDetect] ${JSON.stringify(
        barcodes,
        null,
        2
      )}`;
  } catch (error) {
    pre.textContent = error;
  }
  grabFrameAndDetect();
}


async function createImageBitmapVideo() {
  if (stop) return;
  try {
    const imageBitmap = await createImageBitmap(video);
    console.log(imageBitmap);
    if (!stop)
      pre.textContent = `[createImageBitmap(video)] imageBitmap size: ${imageBitmap.width}x${imageBitmap.height}`;
  } catch (error) {
    pre.textContent = error;
  }
  createImageBitmapVideo();
}

function logTime() {
  time.textContent = `[requestAnimationFrame] ${Date.now()}`;
  console.log(`[requestAnimationFrame] ${Date.now()}`);
  requestAnimationFrame(logTime);
}
logTime();

try {
  BarcodeDetector.getSupportedFormats().then(supportedFormats => {
    info.textContent = `Supported barcode formats: ${supportedFormats.join(
      ", "
    )}`;
  });
} catch (error) {
  info.textContent = error;
}
