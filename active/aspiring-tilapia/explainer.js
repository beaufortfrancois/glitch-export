const reader = new NDEFReader();

async function startScanning() {
  await reader.scan();
  reader.onreading = event => {
    /* handle NDEF messages */
  };
}

const nfcPermissionStatus = await navigator.permissions.query({ name: "nfc" });
if (permissionStatus.state === "granted") {
  // NFC access was previously granted, so we can start NFC scanning now.
  startScanning();
} else {
  // Show a button.
  document.querySelector("button").style.display = "block";
  document.querySelector("button").onclick = event => {
    // Prompt user to allow UA to send and receive info when they tap NFC devices.
    startScanning();
  };
}

const abortController = new AbortController();
abortController.signal.onabort = event => {
  // All NFC operations have been aborted.
};

const reader = new NDEFReader();
await reader.scan({ signal: abortController.signal });

const writer = new NDEFWriter();
await writer.push("foo", { signal: abortController.signal });

document.querySelector("#abortButton").onclick = event => {
  abortController.abort();
};

const reader = new NDEFReader();

await reader.scan({ recordType: "example.com:smart-poster" });
reader.onreading = event => {
  const smartPosterRecord = event.message.records.find(
    record => record.type == "example.com:smart-poster"
  );

  let action, text;

  for (const record of smartPosterRecord.toRecords()) {
    if (record.recordType == "text") {
      const decoder = new TextDecoder(record.encoding);
      text = decoder.decode(record.data);
    } else if (record.recordType == "act") {
      action = record.data.getUint8(0);
    }
  }

  console.log({ text, action });
};
