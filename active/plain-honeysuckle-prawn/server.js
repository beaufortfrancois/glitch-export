const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const path = require("path");

app.use(express.static("public"));
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: "/tmp/"
  })
);

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.post("/api/pictures", async (req, res) => {
  console.log({ req, res });
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log("No file uploaded");
    return res.status(400).send("No file was uploaded.");
  }
  console.log(`Receiving file ${JSON.stringify(req.files.picture)}`);

  const newPicture = path.resolve("/tmp", req.files.picture.name);
  console.log(req.files.picture.mv);
  // const mv = Promise.promisify(req.files.picture.mv);
  await req.files.picture.mv(newPicture);
  console.log("File moved in temporary directory");

  const pictureBucket = storage.bucket(process.env.BUCKET_PICTURES);
  await pictureBucket.upload(newPicture, { resumable: false });
  console.log("Uploaded new picture into Cloud Storage");

  res.redirect("/");
});

// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
