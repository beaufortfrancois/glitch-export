let wasActive = false;
let timeElapsed = 0;
let maxTimeIfIsActive = 0;
(function frame() {
  if (navigator.userActivation.isActive !== wasActive) {
    timeElapsed = performance.now();
  }
  wasActive = navigator.userActivation.isActive;
  let timeIsActive = ((performance.now () - timeElapsed) / 1000).toFixed(2);
  if (wasActive) {
    maxTimeIfIsActive = Math.max(timeIsActive, maxTimeIfIsActive);
  }
  document.body.innerHTML = `\
navigator.userActivation.isActive: ${navigator.userActivation.isActive} for ${timeIsActive}s<br>
navigator.userActivation.hasBeenActive: ${navigator.userActivation.hasBeenActive}<hr>
max time when navigator.userActivation.isActive is true: ${maxTimeIfIsActive}s`;
  requestAnimationFrame(frame);
})();
