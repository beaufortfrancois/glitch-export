let lowPowerCount = 0;
let fullPowerCount = 0;

(async () => {
  const battery = await navigator.getBattery();

  battery.addEventListener("levelchange", () => {
    log(`[levelchange] ${battery.level}`);
    if (battery.level < 0.1) {
      battery.dispatchEvent(new Event("lowpower"));
    } else if (battery.level === 1) {
      battery.dispatchEvent(new Event("fullpower"));
    }
  });

  battery.addEventListener("chargingchange", () => {
    log("[chargingchange]");
  });
  battery.addEventListener("chargingtimechange", () => {
    log("[chargingtimechange]");
  });
  battery.addEventListener("dischargingtimechange", () => {
    log("[dischargingtimechange]");
  });

  // NEW!

  battery.addEventListener("lowpower", () => {
    log("[lowpower] NEW!");
    lowPowerCountElement.textContent = `${++lowPowerCount}`;
  });

  battery.addEventListener("fullpower", () => {
    log("[fullpower] NEW!");
    fullPowerCountElement.textContent = `${++fullPowerCount}`;
  });
})();

/* Utils */

function log(text) {
  logs.textContent += `${text}\r\n`;
}
