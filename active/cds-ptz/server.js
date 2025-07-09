var express = require("express");
var app = express();

var server = app.listen(8081);
var io = require("socket.io")(server);

var fs = require("fs").promises;

let videoStreamingSocket;
let numberOfClientsConnected = 0;

let maxNumberOfClientsConnected = 0;
fs.readFile("maxNumberOfClientsConnected.txt").then(data => {
  maxNumberOfClientsConnected = parseInt(data.toString());
});

// 📢 TODO: Add your public IP address to be able to stream your video camera.
const addressesAllowedToBroadcast = [
  "91.174.82.5",
  "173.68.61.63" // Add more...
];

io.on("connection", socket => {
  const address = socket.handshake.headers["x-forwarded-for"].split(",")[0];
  const allowedToBroadcast = addressesAllowedToBroadcast.includes(address);
  socket.emit("allowedToBroadcast", allowedToBroadcast);

  // Stats
  numberOfClientsConnected++;
  if (numberOfClientsConnected > maxNumberOfClientsConnected) {
    maxNumberOfClientsConnected = numberOfClientsConnected;
    fs.writeFile(
      "maxNumberOfClientsConnected.txt",
      maxNumberOfClientsConnected
    );
  }

  io.emit("clients", {
    type: "connection",
    count: numberOfClientsConnected - 1
  });

  socket.on("broadcast", data => {
    if (!allowedToBroadcast) return;

    videoStreamingSocket = socket;
    // Broadcast video stream to all connected clients.
    io.emit("playback", data);
  });

  socket.on("camera", data => {
    // Send new camera values to the video streaming socket client.
    videoStreamingSocket.emit("camera", data);
  });

  socket.on("settings", data => {
    // Broadcast ptz settings to all connected clients.
    io.emit("settings", data);
  });

  socket.on("capabilities", data => {
    // Broadcast ptz capabilities to all connected clients.
    io.emit("capabilities", data);
  });

  socket.on("disconnect", reason => {
    numberOfClientsConnected--;
    io.emit("clients", {
      type: "disconnection",
      count: numberOfClientsConnected - 1
    });
  });
});

app.use(express.static("public"));
