button1.onclick = async (event) => {
  try {
    // Start scanning...
    const ndef = new NDEFReader();
    const abortController = new AbortController();
    await ndef.scan({ signal: abortController.signal });
    log(`Waiting for user to tap NFC tag...`);

    // Write and read NFC tag.
    const message = await ndef.write(`${now()}`, { readAfter: true });
    log(`> Success! Message has been written.`);
    logMessage(message);

    // Stop scanning after 3 seconds.
    log(`> Continue scanning for 3 seconds...`);
    await new Promise((r) => setTimeout(r, 3000));
    abortController.abort();
    log(`> Scanning now stopped.`);
  } catch (error) {
    log(`${error}`);
  }
};

button2.onclick = async (event) => {
  try {
    const ndef = new NDEFReader();
    log(`Waiting for user to tap NFC tag to write to it...`);
    // Write and read NFC tag.
    const message1 = await ndef.write(`${now()}`, { readAfter: true });
    log(`> Success! Message has been written.`);
    logMessage(message1);
    
    log(`> Now scanning for 3 seconds...`);
    const abortController = new AbortController();
    await ndef.scan({ signal: abortController.signal });
    const message2 = await new Promise((r) => {
      ndef.onreading = (e) => r(e.message);
    });
    logMessage(message2);

    await new Promise((r) => setTimeout(r, 3000));
    abortController.abort();
    log(`> Scanning now stopped.`);
  } catch (error) {
    log(`${error}`);
  }
};

button3.onclick = async (event) => {
  try {
    const ndef = new NDEFReader();
    log(`Waiting for user to tap NFC tag to write to it...`);
    await ndef.write(`${now()}`);
    log(`> Success! Message has been written.`);

    log(`> Now scanning for 3 seconds...`);
    const abortController = new AbortController();
    await ndef.scan({ signal: abortController.signal });
    const message = await new Promise((r) => {
      ndef.onreading = (e) => r(e.message);
    });
    logMessage(message);

    await new Promise((r) => setTimeout(r, 3000));
    abortController.abort();
    log(`> Scanning now stopped.`);
  } catch (error) {
    log(`${error}`);
  }
};


button4.onclick = async (event) => {
  try {
    const ndef = new NDEFReader();
    log(`Waiting for user to tap NFC tag to write to it...`);
    await ndef.write(`${now()}`);
    log(`> Success! Message has been written.`);
  } catch (error) {
    log(`${error}`);
  }
};


/* Utils */

function now() {
  return Intl.DateTimeFormat("en", { timeStyle: "long" }).format(new Date());
}
function log(text) {
  logs.innerHTML += `${text}\r\n`;
}

function logMessage(message) {
  if (message == null) {
    log(`> No message read.`);
    return;
  }
  log(`> NFC tag contains now ${message.records.length} records:`);
  for (const record of message.records) {
    log(`  > recordType: ${record.recordType}`);
    if (record.recordType == "text") {
      const textDecoder = new TextDecoder(record.encoding);
      log(`  > data: ${textDecoder.decode(record.data)}`);
    }
    log(`  - - - - - - - - - - - - - -`);
  }
}
