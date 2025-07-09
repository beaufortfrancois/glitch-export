// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.set('view engine', 'pug')

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  // send the rendered view to the client
  response.render('index');
  
  //response.sendFile(__dirname + '/views/index.html');
});

app.get("/dreams", function (request, response) {
  const saveData = request.headers['save-data'];
  
  response.send('<pre>HTTP Request Headers</pre>' "save-data": </pre>')
  response.send('<pre>' + JSON.stringify(request.headers, 0 , 2) + '</pre>');
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
