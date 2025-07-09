const button = document.querySelector("button");
const video = document.querySelector("video");

let cropTarget;

window.onmessage = (event) => {
    logs.textContent += `Received ${event.data}\r\n`;
  
  console.log(event.data);
  cropTarget = event.data;
  button1.disabled = false;
  button2.disabled = false;
};

button1.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    preferCurrentTab: true,
  });
  const [videoTrack] = stream.getVideoTracks();
  await videoTrack.cropTo(cropTarget);
    logs.textContent += `Cropping video track to ${cropTarget}\r\n`;

  video.srcObject = stream;
};

button2.onclick = async () => {
  if (iframe1.contentDocument.querySelector("#cropArea")) {
    iframe2.contentDocument.body.appendChild(
      iframe1.contentDocument.querySelector("#cropArea")
    );
    logs.textContent += `iframe2.contentDocument.body.appendChild(iframe1.contentDocument.querySelector("#cropArea"));\r\n`;
  } else {
    iframe1.contentDocument.body.appendChild(
      iframe2.contentDocument.querySelector("#cropArea")
    );
    logs.textContent += `iframe1.contentDocument.body.appendChild(iframe2.contentDocument.querySelector("#cropArea"));\r\n`;
  }
};
