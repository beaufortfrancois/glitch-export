blobIframeButton.onclick = async (event) => {
  const iframe1 = await createBlobIframe();
  const iframe2 = await createBlobIframe();

  callSummarizeInIframes(iframe1, iframe2);
};

htmlIframeButton.onclick = async (event) => {
  const iframe1 = await createHtmlIframe();
  const iframe2 = await createHtmlIframe();

  callSummarizeInIframes(iframe1, iframe2);
};

async function callSummarizeInIframes(iframe1, iframe2) {
  try {
    const summarizer1 = await iframe1.contentWindow.Summarizer.create();
    const summarizer2 = await iframe2.contentWindow.Summarizer.create();

    log(
      "Calling summarizer1.summarize('') and summarizer2.summarize('') in parallel in HTML iframes... "
    );
    const [response1, response2] = await Promise.all([
      summarizer1.summarize(""),
      summarizer2.summarize(""),
    ]);
    console.log(`response1: ${response1}`);
    console.log(`response2: ${response2}`);
    log("> Success");
  } catch (error) {
    log(`Error: ${error}`);
  } finally {
    iframe1.remove();
    iframe2.remove();
  }
}

/* Crash tab */

svgImageButton.onclick = async (event) => {
  const content = document.querySelectorAll("img")[1];
  try {
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "image" }],
    });
    const result = await session.prompt([
      "describe this SVG image",
      { type: "image", content },
    ]);
    log(`> Success: ${result}`);
  } catch (error) {
    log(`Error: ${error}`);
  }
};

/* Image Prompt API */

imageFileButton.oninput = async (event) => {
  let content = event.target.files[0];
  if (useCreateImageBitmapCheckbox.checked) {
    content = await createImageBitmap(content);
  }
  let promptArray = [];
  promptArray[0] = imagePromptText.value || "describe";
  promptArray[1] = { type: "image", content };
  try {
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "image" }],
    });
    const result = await session.prompt(promptArray);
    log(`> Success: ${result}`);
  } catch (error) {
    log(`Error: ${error}`);
  }
};

// Draw smiley in canvas.
const ctx = canvas.getContext("2d");
canvas.width = 150;
canvas.height = 150;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = "black";

ctx.lineWidth = 4;
ctx.lineCap = "round";
ctx.beginPath();
ctx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
ctx.moveTo(110, 75);
ctx.arc(75, 75, 35, 0, Math.PI, false); // Mouth (clockwise)
ctx.moveTo(65, 65);
ctx.arc(60, 65, 5, 0, Math.PI * 2, true); // Left eye
ctx.moveTo(95, 65);
ctx.arc(90, 65, 5, 0, Math.PI * 2, true); // Right eye
ctx.stroke();

canvasButton.onclick = async (event) => {
  try {
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "image" }],
    });
    const result = await session.prompt([
      "Describe",
      { type: "image", content: canvas },
    ]);
    log(result);
  } catch (error) {
    log(`Error: ${error}`);
  }
};

compareImagesButton.onclick = async (event) => {
  try {
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "image" }],
    });
    const result = await session.prompt([
      "Give a helpful artistic critique of how well the second image matches the first:",
      { type: "image", content: referenceImage },
      { type: "image", content: userDrawnImage },
    ]);
    log(result);
  } catch (error) {
    log(`Error: ${error}`);
  }
};

/* Text Detector API */

// textDetectorFileButton.oninput = async (event) => {
//   const image = await createImageBitmap(event.target.files[0]);
//   const textDetector = new TextDetector();
//   try {
//     const detectedTextBlocks = await textDetector.detect(image);
//     log(`> Success: detectedTextBlocks.length = ${detectedTextBlocks.length}`);
//     for (const textBlock of detectedTextBlocks) {
//       console.log(textBlock);
//       log(textBlock.rawValue);
//     }
//   } catch (error) {
//     log(`Error: ${error}`);
//   } finally {
//     log(`<hr>`);
//   }
// };

/* Create */

monitorButton.onclick = async (event) => {
  // Bug: https://issues.chromium.org/issues/393553575
  try {
    log(
      `> await LanguageModel.availability() = ${await LanguageModel.availability()}`
    );
    await LanguageModel.create({
      monitor(m) {
        log(
          `> Monitor callback was called. Waiting for downloadprogress event to fire...`
        );
        m.addEventListener("downloadprogress", (e) => {
          log(`> Downloaded ${e.loaded * 100}%`);
        });
      },
    });
  } catch (error) {
    log(`Error: ${error}`);
  }
};

/* Audio prompt API */

let controller;

async function getPrompt(audioElements = []) {
  let prompt = [];
  if (promptAudioFirstCheckbox.checked) {
    prompt.push("transcribe");
  }
  const promises = audioElements.map((audioElement) => {
    return getAudioData(audioElement);
  });
  const audioContents = await Promise.all(promises);
  audioContents.forEach((content) => {
    // console.log(content);
    prompt.push({ type: "audio", content });
  });
  if (!promptAudioFirstCheckbox.checked) {
    prompt.push("transcribe");
  }
  return prompt;
}

async function getAudioData(audioElement) {
  const audio = await fetch(audioElement.src);
  if (useAudioBlobCheckbox.checked) {
    const blob = useFakeBlobCheckbox.checked
      ? new Blob(["foo"])
      : await audio.blob();
    URL.createObjectURL(blob); // TODO: Remove
    return blob;
  }
  const arrayBuffer = await audio.arrayBuffer();
  const audioCtx = new AudioContext();
  const content = await audioCtx.decodeAudioData(arrayBuffer);
  return content;
}

audio1Button.onclick = (event) => {
  promptStreaming([audioElement1]);
};

audio2Button.onclick = (event) => {
  promptStreaming([audioElement2]);
};

audio3Button.onclick = (event) => {
  promptStreaming([audioElement3]);
};

audio4Button.onclick = (event) => {
  promptStreaming([audioElement4]);
};

audio5Button.onclick = (event) => {
  promptStreaming([audioElement5]);
};

bothFrenchAudioButton.onclick = async (event) => {
  logs.innerHTML += `Starting with french long then french short...<br>---<br>`;
  await promptStreaming([audioElement1, audioElement5]);
  logs.innerHTML += `Starting with french short then french long...<br>---<br>`;
  await promptStreaming([audioElement5, audioElement1]);
};

englishAndFrenchAudioButton.onclick = async (event) => {
  logs.innerHTML += `Starting with english then french...<br>---<br>`;
  await promptStreaming([audioElement4, audioElement5]);
  logs.innerHTML += `Starting with french then english...<br>---<br>`;
  await promptStreaming([audioElement5, audioElement4]);
};

manyAudioContentsButton.onclick = async (event) => {
  let i = 0;
  while (i < 1000) {
    i += 50;
    const audioElements = Array(i).fill(audioElement4);
    logs.innerHTML += `Transcribing ${i} audio elements...<br>---<br>`;
    const result = await promptStreaming(audioElements);
    if (!result) {
      throw Error();
    }
  }
};

async function promptStreaming(audioElements) {
  const prompt = await getPrompt(audioElements);
  controller = new AbortController();
  const signal = controller.signal;

  try {
    const params = await LanguageModel.params();
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "audio" }],
      systemPrompt: systemPromptText.value,
      temperature: 0,
      topK: params.defaultTopK,
    });
    // console.log(JSON.stringify(prompt));
    const stream = session.promptStreaming(prompt, { signal });
    for await (const chunk of stream) {
      logs.innerHTML += chunk;
    }
    logs.innerHTML += `<hr>`;
    return true;
  } catch (error) {
    log(`\r\nError: ${error}<hr>`);
    return false;
  }
}

abortButton.onclick = () => {
  controller?.abort();
};

abortAndTranscribeButton.onclick = async () => {
  const controller = new AbortController();
  const signal = controller.signal;

  try {
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "audio" }],
    });
    controller.abort();
    const response = await session.prompt(
      [
        "transcribe",
        { type: "audio", content: await getAudioData(audioElement3) },
      ],
      { signal }
    );
    logs.innerHTML += `${response}<hr>`;
  } catch (error) {
    log(`\r\nError: ${error}<hr>`);
  }
};

/* Utils */

async function createBlobIframe() {
  const iframe = document.createElement("iframe");
  // const loadPromise = new Promise((r) => (iframe.onload = r));
  // iframe.src = URL.createObjectURL(new Blob([], { type: "text/html" }));
  document.body.appendChild(iframe);
  // await loadPromise;
  return iframe;
}

async function createHtmlIframe() {
  const iframe = document.createElement("iframe");
  const loadPromise = new Promise((r) => (iframe.onload = r));
  iframe.src = "iframe.html";
  document.body.appendChild(iframe);
  await loadPromise;
  return iframe;
}

function log(text) {
  logs.innerHTML += `${text}\r\n`;
}
