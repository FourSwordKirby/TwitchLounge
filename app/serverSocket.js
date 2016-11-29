
var User = require('./models/user.js');
var MongoDB = require('./models/mongo.js');
var ListeningRange = require('./listeningRange.js');

exports.handleConnections = function(io, loungename) {

// Namespace specific variables
var loungeUsers = [];
var listeningRanges = [];
var refreshIntervalId = "";
var refreshRate = 50; // milliseconds between interval related calls

var listenRange = 50; // Could be moved into lounge one day... and changed to whatever value

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
                user.color = row.color;
                user.socket = socket.id;
                // socket.client.id is without the namespace starter....
                socket.emit('player: add self', user.jsonify()); // Add yourself to your screen
                socket.emit('player: get all', getPublicPlayersInfo()); // Grab all other users, add to your screen
                loungeUsers.push(user);

                // *** Put any other emitters that need to go AFTER player intialization here *** //
                manageInterval(nsp); // Check if intervals need to be started, if off currently
                socket.broadcast.emit('player: add newcomer', user.siojsonify()); // Tell other users you entered, add your dot to other people's screen
            }
        })
    })

    socket.on('player: move', function(req) {
        if (typeof user !== "undefined") { user.move(req.x, req.y) };
    })

    socket.on('player: local chat', function(msg) { // Local chat msg goes to nearby ppl only, and yourself
        var userIndex = loungeUsers.indexOf(user);
        var nearbyUserIndexes = listeningRanges[userIndex];
        for (var i=0; i<nearbyUserIndexes.length; i++) {
            var nearbyUser = loungeUsers[nearbyUserIndexes[i]];
            socket.broadcast.to(nearbyUser.socket).emit('player: local chat', {"sourceUser": user.siojsonify(), "msg" : msg});
        }
        socket.emit('player: local chat', {"sourceUser": user.siojsonify(), "msg" : msg});
    })

    socket.on('player: update appearance', function(req) {
        // TODO!
    })

    socket.on('anon: get all', function(req) { // A way for anons to grab all users initially, to watch
        socket.emit('player: get all', getPublicPlayersInfo()); // Grab all other users, add to your screen
    })

    socket.on('disconnect', function() {
        var userIndex = loungeUsers.indexOf(user);
        if (userIndex >= 0) {
            loungeUsers.splice(userIndex, 1); // Node is single threaded so no worry of race conditions
            socket.broadcast.emit('player: leave', user.siojsonify()); // Tell other users you left, remove your dot from other people's screen
            manageInterval(nsp); // Check if intervals need to be stopped
        }
        console.log('user disconnected from lounge ' + loungename);
    })

}); // Close namespace lounge socket


// --------------------------------------------------------------------------
// *** Put functions below, could be utility or called by a socket *** //

function getPublicPlayersInfo() {
    return loungeUsers.map(function(user) { return user.siojsonify(); });
}

function manageInterval(nsp) { // Sets up or turns off the interval, which is hooked up to certain events
    if (loungeUsers.length === 1) { // Start it up when 1st user enters
        refreshIntervalId = setInterval(function() {
            // Recalculate listening ranges of users
            listeningRanges = ListeningRange.getListenObjects(loungeUsers, listenRange);

            // Push a frame update to everyone in namespace
            nsp.emit('players: move all', getPublicPlayersInfo());
        }, refreshRate);
    }
    if (loungeUsers.length === 0) { // Turn it off when last user leaves
        clearInterval(refreshIntervalId);
    }
}

} // Close serverSocket export, don't put anything below

