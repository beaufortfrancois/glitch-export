var express = require("express");
var assets = require("./assets");
var app = express();

app.use(express.static("public"));
app.use("/assets", assets);

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/:shortcut", (request, response) => {
  const colors = {
    blue: "#4285F4",
    red: "#DB4437",
    yellow: "#F4B400",
    green: "#0F9D58"
  };
  const color = colors[request.params.shortcut];
  if (!color) {
    return response.send(404);
  }
  response.send(`<style>html { background: ${color} }</style>`);
});

app.listen(process.env.PORT);
