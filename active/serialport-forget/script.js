function log(text) {
  logs.innerHTML += `${text}\r\n`;
}

let port;

if ("serial" in navigator) {
  navigator.serial.getPorts().then((connectedPorts) => {
    if (!connectedPorts.length) {
      log('No serial ports selected. Press the "request ports" button.');
      return;
    }
    port = connectedPorts[0];
    for (const connectedPort of connectedPorts)
      log(`Got serial port.`);
  });
  if (!("forget" in SerialPort.prototype))
    log(
      'Warning! Make sure you run Chromium 103.0.5018.0 to get `SerialPort.forget()`.'
    );
} else {
  log("Serial is not available yet.");
}

requestPortButton.onclick = async (event) => {
  try {
    // Prompt user to select any serial port.
    port = await navigator.serial.requestPort();
    log(`Requested serial port.`);
  } catch (error) {
    log(`${error}`);
  }
};

openPortButton.onclick = async (event) => {
  try {
    if (!port) {
      log("No port to open. Request one first.");
      return;
    }
    // Try opening the first port from getPorts().
    await port.open({baudRate: 9600});
    log(`Opened serial port.`);
  } catch (error) {
    log(`${error}`);
  }
};

closePortButton.onclick = async (event) => {
  try {
    if (!port) {
      log("No port to close. Request one first.");
      return;
    }
    // Try closing the first port from getPorts().
    await port.close();
    log(`Closed serial port.`);
  } catch (error) {
    log(`${error}`);
  }
};

forgetPortButton.onclick = async (event) => {
  try {
    if (!port) {
      log("No port to forget. Request one first.");
      return;
    }
    // Try forgetting the first port from getPorts().
    await port.forget();
    log(`Forgotten serial port.`);
  } catch (error) {
    log(`${error}`);
  }
};
