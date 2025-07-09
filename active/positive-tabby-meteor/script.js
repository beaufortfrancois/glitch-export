function download(blob) {
  const a = document.createElement('a');
  a.download = 'test.txt';
  a.href = URL.createObjectURL(blob);
  console.log(a.href);
  // a.addEventListener('click', () => {
    // setTimeout(() => URL.revokeObjectURL(a.href), 3 * 1000);
  // });
  a.click();
  // URL.revokeObjectURL(a.href);
}

download(new Blob(['test', { type: 'text/plain'}]));