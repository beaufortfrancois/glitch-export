console.log = text => {
  log.textContent += `${text}\r\n`;
};

const myTargetElement = document.body;
let isLockedWithUnadjustedMovement = false;

// Request pointer lock.

firstRequestPointerLockButton.onclick = requestPointerLockWithoutUnadjustedMovement;

function requestPointerLockWithoutUnadjustedMovement() {
  const promise = myTargetElement.requestPointerLock({
    unadjustedMovement: false
  });

  isLockedWithUnadjustedMovement = false;
  if (!promise) return;

  return promise
    .then(() => console.log("pointer is locked without unadjusted movement"))
    .catch(error => {
      console.log(
        `pointer can't be locked without unadjusted movement: "${error.message}"`
      );
    });
}

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement) {
    console.log(`pointer is locked on ${document.pointerLockElement.id}`);
  } else {
    console.log("pointer is unlocked");
  }
});

document.addEventListener("pointerlockerror", () => {
  console.log("pointer lock error");
});

// Disable mouse acceleration.

secondRequestPointerLockButton.onclick = requestPointerLockWithUnadjustedMovement;

function requestPointerLockWithUnadjustedMovement() {
  const promise = myTargetElement.requestPointerLock({
    unadjustedMovement: true
  });

  if (!promise) {
    isLockedWithUnadjustedMovement = false;
    console.log("disabling mouse acceleration not supported");
    return;
  }

  return promise
    .then(() => {
      isLockedWithUnadjustedMovement = true;
      console.log("pointer is locked with unadjusted movement");
    })
    .catch(error => {
      console.log(
        `pointer can't be locked with unadjusted movement: "${error.message}"`
      );
      if (error.name === "NotSupportedError") {
        // Some platforms may not support unadjusted movement.
        // You can request again a regular pointer lock.
        return requestPointerLockWithoutUnadjustedMovement();
      }
    });
}

// Clear data.

clearButton.onclick = _ => {
  maxMovementX = 0;
  maxUnadjustedMovementX = 0;
  minMovementX = 0;
  minUnadjustedMovementX = 0;
  mouseLog.textContent = "movementX: -     max: -     min: -    ";
  unadjustedMouseLog.textContent = "movementX: -     max: -     min: -    ";
  mouseMoveData = [];
};

// Mouse move events handling.

let maxMovementX = 0;
let maxUnadjustedMovementX = 0;
let minMovementX = 0;
let minUnadjustedMovementX = 0;

document.onmousemove = event => {
  const unadjusted =
    document.pointerLockElement && isLockedWithUnadjustedMovement;
  if (!unadjusted) {
    maxMovementX = Math.max(event.movementX, maxMovementX);
    minMovementX = Math.min(event.movementX, minMovementX);
    mouseLog.textContent = `movementX: ${event.movementX
      .toString()
      .padEnd(5)} max: ${maxMovementX
      .toString()
      .padEnd(5)} min: ${minMovementX.toString().padEnd(5)}`;
  } else {
    maxUnadjustedMovementX = Math.max(event.movementX, maxUnadjustedMovementX);
    minUnadjustedMovementX = Math.min(event.movementX, minUnadjustedMovementX);
    unadjustedMouseLog.textContent = `movementX: ${event.movementX
      .toString()
      .padEnd(5)} max: ${maxUnadjustedMovementX
      .toString()
      .padEnd(5)} min: ${minUnadjustedMovementX.toString().padEnd(5)}`;
  }
  mouseMoveData.push({ x: event.movementX, unadjusted });
};

let mouseMoveData = [];

(function draw() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  mouseMoveData
    .filter((mouseMove, index) => mouseMoveData.length - index < canvas.width)
    .forEach((mouseMove, index) => {
      const x = index;
      const y = canvas.height;
      const w = 1;
      const h = -Math.abs(mouseMove.x) * devicePixelRatio;
      const context = canvas.getContext("2d");
      context.fillStyle = mouseMove.unadjusted ? "#ccc" : "#888";
      context.fillRect(x, y, w, h);
    });
  requestAnimationFrame(draw);
})();
