NRF.on('NFCon', () => {
  LED1.write(true);
});


NRF.on('NFCoff', () => {
  LED1.write(false);
});

NRF.nfcURL("http://espruino.com");
