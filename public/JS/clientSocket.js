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


var velX = 0,
    velY = 0,
    speed = 2,
    friction = .9,
    keys = [],
    width = window.innerWidth,
    height=window.innerHeight;

var KEYCODES = {
    "LEFT" : 37,
    "UP" : 38,
    "RIGHT": 39,
    "DOWN" : 40
}

$(document).keydown(function(event){
    keys[event.keyCode] = true;
});

$(document).keyup(function(event){
    keys[event.keyCode] = false;
});

// Handles arrow key movement, updates in DOM and server
function handleMovement() {

    requestAnimationFrame(handleMovement); 

    if (keys[KEYCODES.LEFT]) { 
        if (velX > -speed) velX--;
    }
    if (keys[KEYCODES.RIGHT]) { 
        if (velX < speed) velX++;
    }
    if (keys[KEYCODES.UP]) { 
        if (velY > -speed) velY--; 
    }
    if (keys[KEYCODES.DOWN]) { 
        if (velY < speed) velY++;
    }

    //acceleration and friction
    velY*=friction;
    user.y+=velY;
    velX*=friction;
    user.x+=velX;

    //edges detected
    if (user.x >= width) {
        user.x = width;
    }else if (user.x <= 5) {
        user.x = 5;
    }

    if (user.y > height) {
        user.y = height;
    } else if (user.y <= 5) {
        user.y = 5;
    }
    
    socket.emit('player: move', {x: user.x, y: user.y});
// })
}

handleMovement();

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