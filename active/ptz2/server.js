const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/", (request, response) => {
  let featurePolicy = [];
  if (request.query.camera == "self" || request.query.camera == "none") {
    featurePolicy.push(`camera '${request.query.camera}'`);
  }
  if (
    request.query.microphone == "self" ||
    request.query.microphone == "none"
  ) {
    featurePolicy.push(`microphone '${request.query.microphone}'`);
  }
  if (featurePolicy) {
    response.set("Feature-Policy", featurePolicy.join('; '));
  }
  response.sendFile(__dirname + "/views/index.html");
});

app.listen(process.env.PORT);
