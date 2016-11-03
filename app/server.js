var app = require('express')(); // Web framework
var http = require('http').Server(app);
var morgan = require('morgan'); // Middleware logging
var io = require('socket.io')(http);
var path = require('path');

app.use(morgan('tiny'));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});