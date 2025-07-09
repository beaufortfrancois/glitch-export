let stream;

Array.from(document.querySelectorAll("[id^=test]"))
  .sort((a, b) => a.id.localeCompare(b.id))
  .forEach((element) => {
    const option = document.createElement("option");
    option.value = element.id;
    option.textContent = `<${element.id.replace("test-", "")}>`;
    select.appendChild(option);
  });

select.value = "test-p";
onSelectChange();

select.onchange = onSelectChange;

function onSelectChange() {
  const highlightedElement = document.querySelector(".highlighted");
  if (highlightedElement) highlightedElement.classList.remove("highlighted");
  const element = document.querySelector(`#${select.value}`);
  element.classList.add("highlighted");
}

button.onclick = async () => {
  if (!stream) {
    stream = await navigator.mediaDevices.getDisplayMedia({
      preferCurrentTab: true,
    });
    video.controls = true;
    video.srcObject = stream;
  }

  const element = document.querySelector(`#${select.value}`);
  const cropTarget = await CropTarget.fromElement(element);

  // Trick to make sure cropping is applied after frame is delivered.
  // await new Promise((r) => {
  //   video.addEventListener("timeupdate", r, { once: true });
  // });

  const [videoTrack] = stream.getVideoTracks();
  await videoTrack.cropTo(cropTarget);
};
