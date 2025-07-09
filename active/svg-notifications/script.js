navigator.serviceWorker.register("sw.js");

button1.onclick = async () => {
  showNotification(
    "This is a png image",
    "https://cdn.glitch.global/f6ef6683-f221-459b-9b51-33698897c83e/red.png"
  );
};

button2.onclick = async () => {
  showNotification(
    "This is a svg image",
    "https://cdn.glitch.com/a9975ea6-8949-4bab-addb-8a95021dc2da%2Fillustration.svg"
  );
};

button3.onclick = async () => {
  showNotification(
    "This is an empty svg",
    "https://cdn.glitch.global/f6ef6683-f221-459b-9b51-33698897c83e/empty.svg"
  );
};

async function showNotification(text, icon) {
  const result = await Notification.requestPermission();
  if (result !== "granted") return;
  // new Notification(text, { icon });
  const registration = await navigator.serviceWorker.ready;
  registration.showNotification(text, { icon });
}
