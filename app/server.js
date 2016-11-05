
// Loading server modules
var app = require('express')(); // Web framework
var http = require('http').Server(app);
var morgan = require('morgan'); // Middleware logging
var io = require('socket.io')(http); // Enables web sockets
var path = require('path');
var fs = require("fs"); // File System

// Configuring server modules
app.use(morgan('tiny')); // How the log messages in our terminal appear as stuff happens to our server

// Loading in secret keys
var keys = JSON.parse(fs.readFileSync("keys.json"));

// Loading models
var User = require('./models/user.js');

// ------------------------------------------------------------------
// Playing with Twitch API

// When our server is hit with a GET request at the url /test, we can respond
app.get('/test', function(req, res) { // Given two objects to work with - request, and response
    // In this case we didn't get anything in the request
    // We simply send back a response, which is a file /public/test.html
    res.sendFile(path.join(__dirname, '../public', 'test.html'));
})

// If you want to have the site respond to different URLS, simply follow the pattern above.
// You can also respond to - GET, PUT, POST, DELETE
// GET: When the user is requesting information
// PUT: When the user sends in something to update a file
// POST: When the user creates some new object in our DB
// DELETE: When the user attempts to delete some object
// For now, you can stick with GET

// ------------------------------------------------------------------
// SOCKET STUFF

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// This is how socket works. An event, called connection, happens when a user connects to our server
// When this happens, we create a socket object that contains a lot of information and behavior. See socket.io
// The socket represents one individual user's connection to our server
io.on('connection', function(socket){
  console.log('a user connected');

  // We imported our class User earlier, and can store information in it.
  var user = new User(socket, "test");

  // When the user gets a socket event called 'chat message' it expects the request to also have a obj 'msg'
  socket.on('chat message', function(msg){
    // When this event happens, we then say we want to emit the event 'chat message' to EVERYONE connected!
    io.emit('chat message', msg);
    console.log(user.username);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

// This literally starts the server
http.listen(3000, function(){
  console.log('listening on *:3000');
});

