const controller = new AbortController();
const signal = controller.signal;

btn1.onclick = async () => {
  try {
    const idleDetector = new IdleDetector();

    await idleDetector.start({
      threshold: 60000,
      signal,
    });
    log("IdleDetector is active.");
  } catch (err) {
    log(err.name);
    log(err.message);
  }
};

btn2.onclick = async () => {
controller.abort('foo');
    log("controller.abort()");
};

signal.addEventListener("abort", _ => {
  log("> Aborted");
  log(signal.reason)
});

function log(text) {
  pre.textContent += `${text}\r\n`;
}
