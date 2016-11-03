
// Loading server modules
var app = require('express')(); // Web framework
var http = require('http').Server(app);
var morgan = require('morgan'); // Middleware logging
var io = require('socket.io')(http);
var path = require('path');
var fs = require("fs"); // File System

// Configuring server modules
app.use(morgan('tiny'));

// Loading in secret keys
var keys = JSON.parse(fs.readFileSync("../keys.json"));

// Loading models
var User = require('./models/user.js');

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

io.on('connection', function(socket){
  console.log('a user connected');

  var user = new User(socket, "test");

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log(user.username);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});