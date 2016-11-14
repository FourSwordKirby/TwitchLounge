
var User = require('./models/user.js');
var posX = 0;
var posY = 0;
var numUsers = 0;

exports.handleConnections = function(io, loungename) {

    io.on('connection', function(socket){

        // We imported our class User earlier, and can store information in it.
        // // var user = new User(socket, "test");

          numUsers++;
          console.log(numUsers);
          var user = new User(socket, "test");

          // socket.emit('add circle', {number: numUsers});
          socket.emit('add circle', {number: numUsers, id: socket.id, x:posX, y:posY});
          socket.broadcast.emit('add circle', {number: numUsers, id: socket.id, x:posX, y:posY});


        //when position moves, pass this data back  ?? ? ? ? ? ?? ?? 
          socket.on('move', function(data){
            socket.broadcast.emit('move', {number: numUsers, id: socket.id, x:data.posX, y:data.posY});
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

