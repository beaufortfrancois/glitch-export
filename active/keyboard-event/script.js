document.addEventListener("keydown", e => {
  log(`Key "${e.key}" ${e.repeat ? "repeating" : "pressed"}`);
});

document.addEventListener("keyup", e => {
  log(`Key "${e.key}" released`);
});

/* utils */

function log(text) {
  const pre = document.createElement("pre");
  pre.textContent = text;
  logs.insertBefore(pre, logs.firstChild);
}
