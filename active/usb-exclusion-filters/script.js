function log(text) {
  logs.innerHTML += `${text}\r\n`;
}

requestDeviceButton.onclick = async (event) => {
  try {
    const vendorId = vendorIdInput.value;
    const options = { filters: [] };
    if (vendorId) options.exclusionFilters = [{ vendorId }];
    log(`Calling navigator.usb.requestDevice(${JSON.stringify(options)});`);
    const device = await navigator.usb.requestDevice(options);
    log(
      `Requested "${device.productName}" (vendorId: ${device.vendorId}, productId: ${device.productId})`
    );
  } catch (error) {
    log(`${error}`);
  }
};

(async () => {
  const response = await fetch("usbif.json");
  const json = await response.json();
  json.forEach(({ name, field_vid }) => {
    const option = document.createElement("option");
    option.value = field_vid;
    option.textContent = name;
    vendorIds.appendChild(option);
  });
})();
