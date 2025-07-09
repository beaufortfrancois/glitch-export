// server.js
// where your node app starts
const Readable = require('stream').Readable;

// init project
var express = require('express');
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}


app.get("/data", function (request, response) {
  response.set('Content-Type', 'text/plain');
  response.set('Cache-Control', 'no-cache');
  response.status(200);
  
  const myReadable = new Readable({
    read(size) {
      console.log(new Date());
      this.push(new Date().toJSON() + '\n');
    }
  });
  
  myReadable.pipe(response);
});

app.get("/data-no-store", function (request, response) {
  response.set('Content-Type', 'text/plain');
  response.set('Cache-Control', 'no-store');
  response.status(200);
  
  const myReadable = new Readable({
    read(size) {
      console.log(new Date().toJSON());
      this.push(new Date().toJSON() + '\n');
    }
  });
  
  myReadable.pipe(response);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
