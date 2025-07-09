const abortController = new AbortController();

abortController.signal.onabort = event => {
  // Reset UI.
};

async function startReadingTag() {
  const reader = new NDEFReader();
  await reader.start({ signal: abortController.signal });
  reader.onreading = ({ serialNumber }) => {
    console.log({ serialNumber });
  };
}

function stopReadingTag() {
  abortController.abort();
}

function onStartButtonClick() {
  // Disable button.
  try {
    startReadingTag();
  } catch (e) {
    // Could not start scanning NFC tag.
  } finally {
    // Re-enable button
  }
}
