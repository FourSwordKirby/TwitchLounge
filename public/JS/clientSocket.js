// ------------------------------------------------------------
// INITIALIZATION AND GLOBALS

// Get the lounge code from URL and register socket to namespace
var namespace = window.location.pathname;
var socket = io(namespace);

// Variables
var twitch_id, access_token;
var user, playerAvatar;
var framerate = 100; // In milliseconds, how often we poll for 'frame updates' from server

$(document).ready(function() {
    if (hasAuthenticated()) {
        socket.emit('player: start', {access_token: access_token, twitch_id: twitch_id})
    } else { lurk(); }

    // TODO: Move later as we refactor this demo code into our own
    $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

})

socket.on('player: add self', function(row) {
    user = row; // Server sends us our full user obj
    $("#"+user.twitch_id).remove(); // Just in case of refresh duplication
    playerAvatar = $("<div id=\'"+user.twitch_id+"\' class=\'player\' style=\'left:"+user.x+"; top:"+user.y+";\'></div>");
    $("#players").append(playerAvatar);

    addPlayerEvents();

})

// ------------------------------------------------------------
// USER EVENT HANDLING
// For event listeners that HAVE to be initialized AFTER an authenticated user is made

function addPlayerEvents() {

socket.on('player: get all', getAllUsers);
function getAllUsers(otherUsers) {
    $.each(otherUsers, function(index, otherUser) {
        $("#players").append($("<div id=\'"+otherUser.twitch_id+"\' class=\'player\' style=\'left:"+otherUser.x+"; top:"+otherUser.y+";\'></div>"));
    })
}
socket.on('twitch message', appendTwitchMessage);
function appendTwitchMessage(msg) {
    $('#messages').append(
        $('<li>').append(
            $('<span>').attr('style', msg[0]).text(msg[1]).append(
                $('<span>').attr('style', "color:black").text(msg[2])
            )
        )
    )
}

handleMovement();
var KEYCODES = {
    "LEFT" : 37,
    "UP" : 38,
    "RIGHT": 39,
    "DOWN" : 40
}

var userMoveDefault = 5;
function handleMovement() { // Handles arrow key movement, updates in DOM and server
    $(document).keydown(function(event) { // TODO: Detect diagonal movement
        var newX = user.x;
        var newY = user.y;
        if (event.keyCode === KEYCODES.LEFT) { newX = user.x - userMoveDefault; newY = user.y;}
        if (event.keyCode === KEYCODES.RIGHT) { newX = user.x + userMoveDefault; newY = user.y;}
        if (event.keyCode === KEYCODES.UP) { newY = user.y - userMoveDefault; newX = user.x;}
        if (event.keyCode === KEYCODES.DOWN) { newY = user.y + userMoveDefault; newX = user.x;}
        // playerAvatar.animate({
        //     left: newX,
        //     top: newY
        // });
        user.x = newX;
        user.y = newY;
        playerAvatar.css("left", user.x);
        playerAvatar.css("top", user.y);
        socket.emit('player: move', {x: user.x, y: user.y});
    })
}

// *** Add your own socket listeners in this block, below this line *** //



} // Close addPlayerEvents()


// ------------------------------------------------------------
// ANON/USER EVENT HANDLING
// For event listeners that happen whenever, and everyone can enjoy its effects

window.setInterval(updateFrame, framerate);
function updateFrame() {
    // To prevent one client sending a shit ton of requests for small things, we submit the
    // 'update frame' event every so often, which causes server to send update events in batches.
    // We additionally send in the user to update it on the server here, since other users only
    // see changes based on this frame update anyway.
    socket.emit('update frame');
}

// *** Add your own socket listeners below *** //

socket.on('players: move all', moveAllUsers);
function moveAllUsers(otherUsers) { // Moves all users to updated positions gotten from server
    $.each(otherUsers, function(index, otherUser) {
        $("#"+otherUser.twitch_id).css("left", otherUser.x);
        $("#"+otherUser.twitch_id).css("top", otherUser.y);
    })
}

socket.on('player: add newcomer', function(otherUser) {
    $("#players").append($("<div id=\'"+otherUser.twitch_id+"\' class=\'player\' style=\'left:"+otherUser.x+"; top:"+otherUser.y+";\'></div>"));
})

socket.on('player: leave', function(otherUser) {
    $("#"+otherUser.twitch_id).remove();
})

// ------------------------------------------------------------
// UTILITY FUNCTIONS

function lurk() {} // TODO

function hasAuthenticated() {
    access_token = localStorage.getItem('lounge_token');
    twitch_id = localStorage.getItem('twitch_id');
    return access_token != null && twitch_id != null;
}