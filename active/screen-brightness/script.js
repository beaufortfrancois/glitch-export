button1.onclick = async function () {
  console.log("click");

  try {
    await screen.requestBrightnessIncrease();
    console.log("screen.requestBrightnessIncrease() succeeded");
  } catch (error) {
    console.log(error);
  }
};

button2.onclick = async function () {
  console.log("click");

  try {
    await document.body.requestFullscreen({ increaseBrightness: true });
    console.log(
      "document.body.requestFullscreen({increaseBrightness: true}) succeeded"
    );
  } catch (error) {
    console.log(error);
  }
};

button3.onclick = async function () {
  console.log("click");

  try {
    await document.exitFullscreen();
    console.log(
      "document.exitFullscreen() succeeded"
    );
  } catch (error) {
    console.log(error);
  }
};
