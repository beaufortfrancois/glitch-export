let context;

button1.onclick = async () => {
  if (context) context.close();
  const microphoneStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  context = new AudioContext();
  const source = context.createMediaStreamSource(microphoneStream);

  const scriptProcessor = context.createScriptProcessor(1024);
  scriptProcessor.onaudioprocess = ({ inputBuffer, outputBuffer }) => {
    const inputData = inputBuffer.getChannelData(0);
    outputBuffer.copyToChannel(inputData, /*channelNumber=*/ 0);
  };

  source.connect(scriptProcessor).connect(context.destination);
};

button2.onclick = async () => {
  if (context) context.close();
  const microphoneStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  context = new AudioContext();
  const source = context.createMediaStreamSource(microphoneStream);

  await context.audioWorklet.addModule("worklet-processor.js");
  const worklet = new AudioWorkletNode(context, "worklet-processor");

  source.connect(worklet).connect(context.destination);
};
