scanButton.onclick = async () => {
  let ndef = new NDEFReader();
  await ndef.scan();
  ndef.onreading = ({ message }) => {
    pre.textContent += message.records.map(record => JSON.stringify(record));
  };
};

input.value = `${document.location.origin}?date=${Date.now()}`;

writeButton.onclick = async () => {
  let ndef = new NDEFReader();
  await ndef.write(input.value);
  pre.textContent += `NDEF message written: ${input.value}`;
};
