
var User = require('./models/user.js');
var MongoDB = require('./models/mongo.js');

exports.handleConnections = function(io, loungename) {

var loungeUsers = [];

// NAMESPACING - Creating lounge based on URL
// Namespace creates a special lounge per streamer
var nsp = io.of('/'+loungename);
nsp.on('connection', function(socket){
    console.log('someone connected to a namespaced lounge ' + loungename);

    var user;

    // ------------------------------
    // Emitters

    socket.emit('player: get all', getPublicPlayersInfo());

    // ------------------------------
    // Listeners

    socket.on('player: start', function(req) { // Authenticated user connected, try get user obj
        MongoDB.getUser(req.twitch_id, req.access_token, function(row) {
            if (row !== null) {
                user = new User(row.twitch_id, row.twitch_username, row.twitch_avatar, row.twitch_bio, row.access_token);
                user.socket_id = socket.id;
                loungeUsers.push(user);
                socket.emit('player: add self', user.jsonify());
            }
        })
    })

    socket.on('disconnect', function() {
        // TODO: Remove user from array. Initial concern with potential race conditions...
        console.log('user disconnected from lounge ' + loungename);
    })

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

    // ------------------------------

}); // Close namespace lounge socket

function getPublicPlayersInfo() {
    return loungeUsers.map(function(user) { return user.siojsonify(); });
}

} // Close serverSocket export

