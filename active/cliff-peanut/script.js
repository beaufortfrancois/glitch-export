/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console


const start = async () => {
  let devices = await navigator.mediaDevices.enumerateDevices();
  console.log(devices)
  let device = devices.find(device => device.kind === 'videoinput');

  let stream = await navigator.mediaDevices.getUserMedia({
    "video": {
      deviceId: {exact : device.deviceId}
    }
  });

  let textDetector = new TextDetector();
  let track = stream.getVideoTracks()[0];
  let settings = track.getSettings();
  let imageCapture = new ImageCapture(track);
  videoElement.width = settings.width;
  videoElement.height = settings.height;
  
  let context = videoElement.getContext('2d');
  let worker = new Worker('worker.js');
  let frameProcessing = false;
  let boundingBoxes = [];
  
  worker.onmessage = (response) => {
    // Text detection is off main thread, so only update when we have a frame result
    boundingBoxes = response.data.results || [];
    frameProcessing = false;
  }
  
  const detect = async () => {
    try {
      let frame = await imageCapture.grabFrame();
      context.drawImage(frame, 0, 0);
      
      if(frameProcessing === false) {
        worker.postMessage({frame}, frame);
        // we know we can't process at 60fps, so only do one at a time.
        frameProcessing = true;
      }
      
      // We might not have a new result, still draw the old box
      for(let boundingBox of boundingBoxes) {
        context.strokeStyle = 'red';
        context.strokeRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height) 
      }
      requestAnimationFrame(detect);
    } catch(err) {
      console.log(err)
    }
    
  };
  
  requestAnimationFrame(detect)
  
};


document.documentElement.onlclick = start;

start();
