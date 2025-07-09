function log(text) {
  pre.textContent += text + "\r\n";
}

window.onerror = event => log(event);

const params = new URLSearchParams(document.location.search.substring(1));
detect(params.has("friends") ? friends : monalisa, canvas);

async function detect(image, canvas) {
  image.classList.add("visible");
  // const imageBitmap = await createImageBitmap(image);
  const faceDetector = new FaceDetector({ fastMode: params.has("fast") });
  faceDetector
    .detect(image) //imageBitmap)
    .then(faces => {
      const context = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      log(`faces: ${JSON.stringify(faces, null, 2)}`);
      faces.forEach(face => {
        context.strokeStyle = "greenyellow";
        context.fillStyle = "greenyellow";
        context.lineWidth = 2;
        context.strokeRect(
          face.boundingBox.x,
          face.boundingBox.y,
          face.boundingBox.width,
          face.boundingBox.height
        );

        face.landmarks?.forEach(landmark => {
          const location = landmark.locations[0];
          context.beginPath();

          if (landmark.locations.length === 1) {
            context.arc(location.x, location.y, 2, 0, 2 * Math.PI);
            context.closePath();
            context.fill();
            return;
          }
          context.moveTo(location.x, location.y);
          for (const { x, y } of landmark.locations) {
            context.lineTo(x, y);
          }
          context.closePath();
          context.stroke();
        });
      });
    })
    .catch(error => {
      log(error);
    });
}

// face pose

// for (let i = 0; i < 4; i++) {
//   const canvas = document.createElement("canvas");
//   const context = canvas.getContext("2d");
//   canvas.width = 170;
//   canvas.height = facepose.height;
//   context.drawImage(
//     facepose,
//     canvas.width * i,
//     0,
//     canvas.width,
//     canvas.height,
//     0,
//     0,
//     canvas.width,
//     canvas.height
//   );
//   const destination = document.createElement("canvas");
//   document.body.appendChild(destination);
//   detect(canvas, destination);
// }
