
var User = require('./models/user.js');

exports.handleConnections = function(io) {

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

}
