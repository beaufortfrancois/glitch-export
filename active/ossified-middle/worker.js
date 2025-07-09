let textDetector = new TextDetector();

self.onmessage = async (o) => {
  const frame = o.data.frame;
  
  let results = await textDetector.detect(frame);

  if (results.length === 0) self.postMessage({results: undefined});
  else {
    self.postMessage({results: results.map(res => res.boundingBox)});
  }
}