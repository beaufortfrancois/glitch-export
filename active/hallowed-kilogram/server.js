var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

app.use(express.static('public'));
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

var server = app.listen(9000);
// var server = PeerServer({port: 9000, path: '/myapp', proxied: true});

var peerserver = ExpressPeerServer(server, { debug: true, proxied: true });