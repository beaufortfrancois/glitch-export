const pre = document.querySelector("pre");
const button = document.querySelector("button");

const decoder = new TextDecoderStream();

const upperCaseTransformer = new TransformStream({
  transform(chunk, controller) {
    console.log(chunk);
    controller.enqueue(chunk.toUpperCase());
  },
});

button.addEventListener("click", async () => {
  const response = await fetch("/script.js");
  const readableStream = response.body
    .pipeThrough(decoder)
    .pipeThrough(upperCaseTransformer);

  const reader = readableStream.getReader();
  pre.textContent = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    pre.textContent += value;
  }
});
