button1.onclick = () => {
  callGetDisplayMedia({
    before: true,
    focusBehavior: "no-focus-change",
  });
};

button2.onclick = () => {
  callGetDisplayMedia({
    during: true,
    focusBehavior: "no-focus-change",
  });
};

button3.onclick = () => {
  callGetDisplayMedia({
    after: true,
    focusBehavior: "no-focus-change",
  });
};
button4.onclick = () => {
  callGetDisplayMedia({
    before: true,
    focusBehavior: "focus-captured-surface",
  });
};

button5.onclick = () => {
  callGetDisplayMedia({
    during: true,
    focusBehavior: "focus-captured-surface",
  });
};

button6.onclick = () => {
  callGetDisplayMedia({
    after: true,
    focusBehavior: "focus-captured-surface",
  });
};

button7.onclick = () => {
  callGetDisplayMedia({});
};

button8.onclick = () => {
  callGetDisplayMedia({
    passController: false,
  });
};

button9.onclick = () => {
  callGetDisplayMedia({
    during: true,
    focusBehavior: "no-focus-change",
    stopTracks: true,
  });
};

button10.onclick = () => {
  window.open("set-capture-handle-config.html");
};

button11.onclick = () => {
  callGetDisplayMedia({
    during: true,
    useCaptureHandle: true,
  });
};

button12.onclick = () => {
  callGetDisplayMedia({
    after: true,
    useCaptureHandle: true,
  });
};

button13.onclick = () => {
  callGetDisplayMedia({
    before: true,
    before2: true,
    focusBehavior: "focus-captured-surface",
    focusBehavior2: "no-focus-change",
  });
};

button14.onclick = () => {
  callGetDisplayMedia({
    during: true,
    during2: true,
    focusBehavior: "focus-captured-surface",
    focusBehavior2: "no-focus-change",
  });
};

button15.onclick = () => {
  callGetDisplayMedia({
    after: true,
    after2: true,
    focusBehavior: "focus-captured-surface",
    focusBehavior2: "no-focus-change",
  });
};

button16.onclick = () => {
  callGetDisplayMedia({
    focusBehavior: "no-focus-change",
    whilePickerIsDisplayed: true,
  });
};

let captureController;

async function callGetDisplayMedia({
  passController = true,
  before = false,
  during = false,
  after = false,
  stopTracks = false,
  useCaptureHandle = false,
  focusBehavior = "",
  before2 = false,
  during2 = false,
  after2 = false,
  focusBehavior2 = "",
  whilePickerIsDisplayed = false,
}) {
  if (!reuseControllerCheckbox.checked && passController) {
    captureController = new CaptureController();
    reuseControllerCheckbox.disabled = false;
  }

  if (before) {
    log(`Calling captureController.setFocusBehavior("${focusBehavior}")`);
    captureController.setFocusBehavior(focusBehavior);
  }

  if (before2) {
    log(`Calling captureController.setFocusBehavior("${focusBehavior2}")`);
    captureController.setFocusBehavior(focusBehavior2);
  }

  const options = {
    video: { displaySurface: "browser" },
    selfBrowserSurface: "exclude",
  };
  if (captureController && passController) {
    options["controller"] = captureController;
  }
  log(
    `Calling navigator.mediaDevices.getDisplayMedia({${JSON.stringify(
      options,
      null,
      2
    )}})`
  );
  const promise = navigator.mediaDevices.getDisplayMedia(options);
  if (whilePickerIsDisplayed) {
    setTimeout(() => {
      log(
        `Calling captureController.setFocusBehavior("${focusBehavior}") while picker is displayed`
      );
      captureController.setFocusBehavior(focusBehavior);
    });
  }
  const stream = await promise;
  if (stopTracks) {
    stream.getTracks().forEach((track) => track.stop());
  }

  if (useCaptureHandle) {
    const captureHandle = stream.getVideoTracks()[0].getCaptureHandle();
    if (captureHandle) {
      focusBehavior = captureHandle.handle;
    } else {
      throw Error("Capture handle is null!");
    }
  }

  if (during) {
    log(`Calling captureController.setFocusBehavior("${focusBehavior}")`);
    captureController.setFocusBehavior(focusBehavior);
  }

  if (during2) {
    log(`Calling captureController.setFocusBehavior("${focusBehavior2}")`);
    captureController.setFocusBehavior(focusBehavior2);
  }

  if (after) {
    log(`Waiting 500ms...`);
    setTimeout(() => {
      log(`Calling captureController.setFocusBehavior("${focusBehavior}")`);
      captureController.setFocusBehavior(focusBehavior);
      if (after2) {
        log(`Calling captureController.setFocusBehavior("${focusBehavior2}")`);
        captureController.setFocusBehavior(focusBehavior2);
      }
      log("> Success!");
    }, 500);
  } else {
    log("> Success!");
  }
}

/* Utils */

function log(text) {
  logs.textContent += `${text}\r\n`;
}
