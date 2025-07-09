const r = new NDEFReader();
r.scan();
r.onreading = ({ serialNumber }) => {
  pre.textContent += `> Serial Number: ${serialNumber}\n`;
};

async function writeTag() {
  const w = new NDEFWriter();
  await w.push("philippe");
}
