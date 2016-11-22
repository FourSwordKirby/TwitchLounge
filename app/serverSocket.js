
var User = require('./models/user.js');
var MongoDB = require('./models/mongo.js');

exports.handleConnections = function(io, loungename) {

var loungeUsers = [];

// --------------------------------------------------------------------------

// NAMESPACING - Creating lounge based on URL
// Namespace creates a special lounge per streamer
var nsp = io.of('/'+loungename);
nsp.on('connection', function(socket){
    console.log('someone connected to a namespaced lounge ' + loungename);
    
    // *** Initialize any variables the individual user who just connected would need here *** //
    var user;

    // --------------------------------------------------------------------------
    // *** Generally put socket listeners and emitters in this block *** //

    socket.on('player: start', function(req) { // Authenticated user connected, try get user obj
        MongoDB.getUser({"twitch_id" : req.twitch_id, "access_token" : req.access_token}, function(row) {
            if (row !== null) {
                user = new User(row.twitch_id, row.twitch_username, row.twitch_avatar, row.twitch_bio, row.access_token);
                user.socket_id = socket.id;
                socket.emit('player: add self', user.jsonify()); // Add yourself to your screen
                socket.emit('player: get all', getPublicPlayersInfo()); // Grab all other users, add to your screen
                loungeUsers.push(user);

                // *** Put any other emitters that need to go AFTER player intialization here *** //
                socket.broadcast.emit('player: add newcomer', user.siojsonify()); // Tell other users you entered, add your dot to other people's screen
            }
        })
    })

    socket.on('player: move', function(req) {
        user.x = req.x;
        user.y = req.y;
    })

    socket.on('update frame', function() { // Handles all events fired to update frame for users
        socket.emit('players: move all', getPublicPlayersInfo());
    })

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

    socket.on('disconnect', function() {
        var userIndex = loungeUsers.indexOf(user);
        loungeUsers.splice(userIndex, 1); // Node is single threaded so no worry of race conditions
        socket.broadcast.emit('player: leave', user.siojsonify()); // Tell other users you left, remove your dot from other people's screen
        console.log('user disconnected from lounge ' + loungename);
    })

}); // Close namespace lounge socket


// --------------------------------------------------------------------------
// *** Put functions below, could be utility or called by a socket *** //

function getPublicPlayersInfo() {
    return loungeUsers.map(function(user) { return user.siojsonify(); });
}


} // Close serverSocket export, don't put anything below

