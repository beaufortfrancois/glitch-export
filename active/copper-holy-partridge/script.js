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

    const blob = new Blob(chunks, { type: recorder.mimeType });

    // Save it for later
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.target = "_blank";
    a.download = "recording.mp3";
    a.click();

    await transcribe(blob);
  } catch (error) {
    log(error);
  } finally {
    logs.innerHTML += `<hr>`;
    audioStream?.getTracks().forEach((track) => track.stop());
  }
};

inputFile.oninput = async (event) => {
  try {
    const file = event.target.files[0];
    const blob = new Blob([file]);
    audioElement.src = URL.createObjectURL(blob);
    await transcribe(blob);
  } catch (error) {
    log(error);
  } finally {
    logs.innerHTML += `<hr>`;
  }
};

async function transcribe(blob) {
  const audioCtx = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const content = await audioCtx.decodeAudioData(arrayBuffer);
  
  const params = await LanguageModel.params();
  const session = await LanguageModel.create({
    expectedInputs: [{ type: "audio" }],
    temperature: 0.1,
    topK: params.defaultTopK,
  });

  const stream = session.promptStreaming([
    { type: "audio", content },
    " transcribe this short audio.",
  ]);
  for await (const chunk of stream) {
    logs.innerHTML += `${chunk}`;
  }
}

function log(text) {
  logs.innerHTML += `${text}\r\n`;
}
