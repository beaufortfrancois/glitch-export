
function reportError(e) {
  // Report error to the main thread
  console.log(e)
  postMessage(e.message);
}

async function captureAndEncode(readable, offscreenCanvas, fps, codec, encodedVideoChunkOutputCallback) {
  const config = {
    codec,
    // hardwareAcceleration: "prefer-hardware",
    width: offscreenCanvas.width,
    height: offscreenCanvas.height,
    bitrate: 1000000,
    // avc : { format: "annexb" },
    framerate: fps
  };
  const {supported} = await VideoEncoder.isConfigSupported(config);
  if (!supported) {
    const ctx = offscreenCanvas.getContext("2d");
    ctx.font = '50px serif';
    ctx.fillText(codec, 20, 50);
    ctx.fillText('not supported', 20, 100);
    return;
    
  }
  const encoder = new VideoEncoder({
    output: encodedVideoChunkOutputCallback,
    error: reportError
  });
  encoder.configure(config);

  const reader = readable.getReader();  
  async function readFrame () {          
    const result = await reader.read();
    const videoFrameToEncode = result.value;
    if (encoder.encodeQueueSize < 2) {
      encoder.encode(videoFrameToEncode);  
    } else {
      console.log("dropping a frame");
    }
    videoFrameToEncode.close();

    setTimeout(readFrame, 0);
  };

  readFrame();
}

function startDecodingAndRendering(offscreenCanvas, codec) {
  let ctx = offscreenCanvas.getContext("2d");
  let pendingVideoFrames = [];
  let underflow = true;
  
    ctx.font = '50px serif';
    ctx.fillText(codec, 20, 50);

  async function renderVideoFrame() {
    if (pendingVideoFrames.length == 0) {
      underflow = true;
      return;
    }
    const videoFrame = pendingVideoFrames.shift();
    underflow = false;

    ctx.drawImage(videoFrame, 0, 0);
    ctx.font = '50px serif';
    ctx.fillText(codec, 20, 50);

    videoFrame.close();      
    
    // Immediately schedule rendering of the next frame
    setTimeout(renderVideoFrame, 0);        
  }

  function videoFrameOutputCallback(frame) {
    pendingVideoFrames.push(frame);
    if (underflow) {
      underflow = false;
      setTimeout(renderVideoFrame, 0);      
    }
  }

  const decoder = new VideoDecoder({
    output: videoFrameOutputCallback,
    error: reportError
  });
  return decoder;
}   


self.onmessage = async function(e) {
  const readable = e.data.readable;
  const offscreenCanvas = e.data.offscreenCanvas;
  const fps = e.data.fps;
  const codec = e.data.codec;
  
  const decoder = startDecodingAndRendering(offscreenCanvas, codec);
  function encodedVideoChunkOutputCallback(chunk, metadata) {
    let config = metadata.decoderConfig;
    if (config) {
      console.log("decoder reconfig", config);
      decoder.configure(config);
    }
    decoder.decode(chunk);
  }
  captureAndEncode(readable, offscreenCanvas, fps, codec, encodedVideoChunkOutputCallback);
}