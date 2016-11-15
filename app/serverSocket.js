
var User = require('./models/user.js');
var posX = 0;
var posY = 0;

exports.handleConnections = function(io, loungename) {
var numUsers = 0;

    io.on('connection', function(socket){

        // We imported our class User earlier, and can store information in it.
        // // var user = new User(socket, "test");
  //       socket.on('connect', function(){
  // console.log("user connected");
  //         numUsers++;
  //         // console.log(numUsers);
  //         var user = new User(socket, "test");
  //       });
        console.log("user connected");
          numUsers++;

          console.log(numUsers);
          var user = new User(socket, "test");

        io.emit('add circle', {number: numUsers});

        // when position moves, pass this data back  ?? ? ? ? ? ?? ?? 
        socket.on('movechar', function(data){
            // socket.emit('move', {number: numUsers, id: socket.id, x:data.x, y:data.y});

            io.emit('move', {number: numUsers, id: socket.id, x:data.x, y:data.y});
            // console.log(user.username);

        });

        // When the user gets a socket event called 'chat message' it expects the request to also have a obj 'msg'
        socket.on('chat message', function(msg){
            // When this event happens, we then say we want to emit the event 'chat message' to EVERYONE connected!
            io.emit('chat message', msg);
            // console.log(user.username);

        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
            numUsers--;
        io.emit('add circle', {number: numUsers});



        });

        // ------------------------------------------------------------
        // HOST SOCKET EVENTS

        socket.on('make lounge', function() {

        })



        // ------------------------------------------------------------
        // USER SOCKET EVENTS

    });

    // NAMESPACING - Creating lounge based on URL
    // Namespace creates a special lounge per streamer
    var nsp = io.of('/'+loungename);
    nsp.on('connection', function(socket){
        console.log('someone connected to a namespaced lounge');

    });


}

