button.onclick = async () => {
  let audioStream;
  try {
    // Record speech
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    const recorder = new MediaRecorder(audioStream);
    recorder.ondataavailable = ({ data }) => {
      chunks.push(data);
    };
    recorder.start();
    await new Promise((r) => setTimeout(r, 5000));
    recorder.stop();
    await new Promise((r) => (recorder.onstop = r));

    // Transcribe speech recording
    const audioCtx = new AudioContext();
    const blob = new Blob(chunks, { type: recorder.mimeType });
    const arrayBuffer = await blob.arrayBuffer();
    const content = await audioCtx.decodeAudioData(arrayBuffer);

    const capabilities = await window.ai.languageModel.capabilities();
    const session = await window.ai.languageModel.create({
      temperature: 0.1,
      topK: capabilities.defaultTopK,
    });

    const stream = session.promptStreaming([
      { type: "audio", content },
      " transcribe this short audio.",
    ]);
    for await (const chunk of stream) {
      logs.innerHTML += `${chunk}`;
    }
  } catch (error) {
    log(error);
  } finally {
    logs.innerHTML += `<hr>`;
    audioStream?.getTracks().forEach((track) => track.stop());
  }
};

function log(text) {
  logs.innerHTML += `${text}\r\n`;
}
