class ShapeDetectionProxy {
  constructor(type) {
    this._type = type;
    this._boundingBoxes = [];
    this._frameProcessing = false;
    this._worker = new Worker(`worker.js?${type}`);
    this._worker.onmessage = (response) => {
      const results = response.data.results;
      // Text detection is off main thread, so only update when we have a frame result
      this._boundingBoxes = results.map(result => result.boundingBox);

      this._frameProcessing = false;
     
      performance.mark(`end ${this._type}`) // 500ms
      performance.measure(`difference ${this._type}`, `start ${this._type}`, `end ${this._type}`);
      
    };
  }
  
  async detect(frame) {
    if (this._frameProcessing === false) {
      const newFrame = await createImageBitmap(frame);
      performance.mark(`start ${this._type}`);
      this._worker.postMessage({frame: newFrame}, [newFrame]);
      this._frameProcessing = true;
    } 
  }
  
  get boundingBoxes() {
    return this._boundingBoxes;
  }
  
  get isProcessing() {
    return this._frameProcessing;
  }
}

const start = async () => {
  let devices = await navigator.mediaDevices.enumerateDevices();
  let device = devices.find(device => device.kind === 'videoinput' && device.label.includes('back'));
  if (device === undefined) device = devices.find(device => device.kind === 'videoinput');

  let stream = await navigator.mediaDevices.getUserMedia({
    "video": {
      deviceId: {exact : device.deviceId}
    }
  });

  let track = stream.getVideoTracks()[0];
  let settings = track.getSettings();
  let imageCapture = new ImageCapture(track);
  videoElement.width = settings.width;
  videoElement.height = settings.height;
  
  let context = videoElement.getContext('2d');
  let textDetector = new ShapeDetectionProxy('text');
  let faceDetector = new ShapeDetectionProxy('face');
  let barcodeDetector = new ShapeDetectionProxy('barcode');
  
  const detect = async () => {
    try {
      let frame = await imageCapture.grabFrame();
      context.drawImage(frame, 0, 0);
      
      if(faceDetector.isProcessing === false) faceDetector.detect(frame);
      if(barcodeDetector.isProcessing === false) barcodeDetector.detect(frame);
      if(textDetector.isProcessing === false) textDetector.detect(frame);
      
      frame.close();
      
      // We might not have a new result, still draw the old box
      for(let boundingBox of faceDetector.boundingBoxes) {
        context.strokeStyle = 'red';
        context.strokeRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height) 
      }
      
      for(let boundingBox of textDetector.boundingBoxes) {
        context.strokeStyle = 'blue';
        context.strokeRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height) 
      }
      
      for(let boundingBox of barcodeDetector.boundingBoxes) {
        context.strokeStyle = 'green';
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
