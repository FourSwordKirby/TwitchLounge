// ------------------------------------------------------------
// INITIALIZATION AND GLOBALS

// Get the lounge code from URL and register socket to namespace
var namespace = window.location.pathname;
var socket = io(namespace);

// Variables
var twitch_id, access_token;
var user, playerAvatar;

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
    playerAvatar = createPlayerEl(user);
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
        $("#players").append(createPlayerEl(otherUser));
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

// Handle player movement
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
}
handleMovement();

// *** Add your own socket listeners in this block, below this line *** //

// Local chat - Entering message
$("#local-chatroom").removeClass("hide");
$("#local-chatroom form").submit(function() {
    var localmsg = $(this).find("input[type=text]").val();
    $(this).find("input[type=text]").val(""); //Clear
    socket.emit('player: local chat', localmsg);
    return false;
})

// // Local chat - recieving messages
socket.on('player: local chat', appendLocalchat);
function appendLocalchat(res) {
    var sourceUser = res.sourceUser;
    var msg = res.msg;
    var msgLi = $("<li>"+sourceUser.twitch_username + ": " + msg+"</li>");
    var fadeTime = (msg.length/20)*1000; // Assuming people read at an average of 15 characters per second...
    $("#"+sourceUser.twitch_id+" .localmsgs").append(msgLi);
    setTimeout(function(){
        msgLi.fadeOut(400, function() {
            msgLi.remove();
        })
    }, 1500 + fadeTime);
}

} // Close addPlayerEvents()


// ------------------------------------------------------------
// ANON/USER EVENT HANDLING
// For event listeners that happen whenever, and everyone can enjoy its effects

// *** Add your own socket listeners below *** //

socket.on('players: move all', moveAllUsers);
function moveAllUsers(otherUsers) { // Moves all users to updated positions gotten from server
    $.each(otherUsers, function(index, otherUser) {
        $("#"+otherUser.twitch_id).css("left", otherUser.x);
        $("#"+otherUser.twitch_id).css("top", otherUser.y);
    })
}

socket.on('player: add newcomer', function(otherUser) {
    $("#players").append(createPlayerEl(otherUser));
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

// TODO: In future maybe people just choose and save a custom color for their dot or something...
function randomColor() {
    var rgb = [];
    for(var i = 0; i < 3; i++) {
        rgb.push(Math.floor(Math.random() * 255));
    }
    return 'rgb('+ rgb.join(',') +')';
}

function createPlayerEl(user) { // Element appended when a new player enters
    var color = randomColor();
    return $("<div id=\'"+user.twitch_id+"\' class=\'player\' style=\'left:"+user.x+"; top:"+user.y+"; background-color: "+color+"\'><ul class=\'localmsgs\'></ul></div>");
}
