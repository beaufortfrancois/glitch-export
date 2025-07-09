   self.onmessage = async ({data: {videoTrack}}) => {
     const processor = new MediaStreamTrackProcessor({videoTrack});
     let readable = processor.readable;

     const capabilities = videoTrack.getCapabilities();
     if (capabilities.backgroundBlur && capabilities.backgroundBlur.max > 0) {
       // The platform supports background blurring.
       // Let's use platform background blurring.
       // No transformers are needed.
       await track.applyConstraints({
         advanced: [{backgroundBlur: capabilities.backgroundBlur.max}]
       });
     } else {
       // The platform does not support background blurring.
       // Let's use custom face detection to aid custom background blurring.
       importScripts('custom-face-detection.js', 'custom-background-blur.js');
       const transformer = new TransformStream({
         async transform(frame, controller) {
           // Use a custom face detection.
           const detectedFaces = await detectFaces(frame);
           // Use a custom background blurring.
           const newFrame = await blurBackground(frame, detectedFaces);
           frame.close();
           controller.enqueue(newFrame);
         }
       });
       // Pipe through a custom transformer.
       readable = readable.pipeThrough(transformer);
     };
     if (readable === processor.readable) {
       // No transformers were needed.
       // Pass the original track back to the main.
       parent.postMessage({videoTrack: videoTrack}, [videoTrack]);
     } else {
       // Transformers were needed.
       // Use a generator to generate a new video track and pass it to the main.
       const generator = new VideoTrackGenerator();
       parent.postMessage({videoTrack: generator.track}, [generator.track]);
       await readable.pipeTo(generator.writable);
     }
   };