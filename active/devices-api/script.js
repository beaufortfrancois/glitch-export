bluetoothButton.onclick = async event => {
  navigator.bluetooth.requestDevice({
    acceptAllDevices: true
  });
};

hidButton.onclick = async event => {
  navigator.hid.requestDevice({ filters: [] });
};

nfcButton.onclick = async event => {
  const reader = new NDEFReader();
  reader.scan();
};

serialButton.onclick = async event => {
  navigator.serial.requestPort();
};

usbButton.onclick = async event => {
  navigator.usb.requestDevice({ filters: [] });
};
