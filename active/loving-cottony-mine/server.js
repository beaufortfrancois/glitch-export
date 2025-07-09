const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.set("Link", "<data:text/css,html{background:pink}>; rel=stylesheet");
  res.status(204);
});

app.listen(process.env.PORT);
