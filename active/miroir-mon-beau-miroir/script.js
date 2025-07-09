async function describePerson() {
  const session = await LanguageModel.create({
    expectedInputs: [{ type: "image" }],
  });
  const prompt =
    "Using 'you,' humorously describe the person in this image. Emphasize the absurdity of their pose and expression.";

  const response = await session.prompt([
    prompt,
    { type: "image", content: video },
  ]);
  speechSynthesis.speak(new SpeechSynthesisUtterance(response));

  const params = new URLSearchParams(window.location.search);
  if (params.has("debug")) {
    logs.innerHTML = `Debug: ${response}`;
  }
}

button.onclick = async () => {
  video.classList.add("blur");
  try {
    video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    await video.play();
    await describePerson();
  } catch (error) {
    statusMessage.textContent = error;
  } finally {
    video.classList.remove("blur");
  }
};

window.onunload = speechSynthesis.cancel();
