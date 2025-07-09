const copyButton = document.querySelector("#copyButton");
const out = document.querySelector("#out");

if ("clipboard" in navigator) {
  copyButton.addEventListener("click", () => {
    navigator.clipboard
      .writeText(out.value)
      .then(() => {
        console.log("Text copied");
      })
      .catch((err) => console.error(err.name, err.message));
  });
} else {
  copyButton.addEventListener("click", () => {
    const textArea = document.createElement("textarea");
    textArea.value = out.value;
    textArea.style.opacity = 0;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const success = document.execCommand("copy");
      console.log(`Text copy was ${success ? "successful" : "unsuccessful"}.`);
    } catch (err) {
      console.error(err.name, err.message);
    }
    document.body.removeChild(textArea);
  });
}
