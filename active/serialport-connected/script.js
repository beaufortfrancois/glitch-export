navigator.serial.getPorts().then((ports) => {
  for (const port of ports)
    log(`Got serial port. Connected: ${port.connected}`);
});

navigator.serial.onconnect = ({ target: port }) => {
  log(`onconnect event fired. Connected: ${port.connected}`);
};
navigator.serial.ondisconnect = ({ target: port }) => {
  log(`ondisconnect event fired. Connected: ${port.connected}`);
};

requestPortButton.onclick = async (event) => {
  const port = await navigator.serial.requestPort();
  log(`Requested serial port. Connected: ${port.connected}`);
};

function log(text) {
  logs.innerHTML += `${text}\r\n`;
}
