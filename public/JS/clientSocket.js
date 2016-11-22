// ------------------------------------------------------------
// INITIALIZATION AND GLOBALS

// Get the lounge code from URL and register socket to namespace
var namespace = window.location.pathname;
var socket = io(namespace);

// Variables
var twitch_id, access_token;
var user, playerAvatar;

// Load TMI
// var options = {
//     options: {
//         debut: true
//     },
//     connection: {
//         cluster: "aws",
//         recconect: true
//     },
//     identity: {
//         username: keys["Twitch"]["username"],
//         password: keys["Twitch"]["password"]
//     },
//     channels: ["mossyqualia"]
// };

// var client = new tmi.client(options);
// client.connect();


$(document).ready(function() {
    if (hasAuthenticated()) {
        socket.emit('player: start', {access_token: access_token, twitch_id: twitch_id})
    } else { lurk(); }

    // TODO: Move later as we refactor this demo code into our own
    $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        console.log($('#m').val())
        $('#m').val('');
        return false;
    });

})

// ------------------------------------------------------------------
// Ralph's IRC Twitch chat code
// Send chat messages to socket

var defaultColors = [
        '#FF0000','#0000FF','#008000','#B22222','#FF7F50',
        '#9ACD32','#FF4500','#2E8B57','#DAA520','#D2691E',
        '#5F9EA0','#1E90FF','#FF69B4','#8A2BE2','#00FF7F'
    ]
var randomColorsChosen = {};

function resolveColor(chan, name, color) {
    if(color !== null) {
        return color;
    }
    if(!(chan in randomColorsChosen)) {
        randomColorsChosen[chan] = {};
    }
    if(name in randomColorsChosen[chan]) {
        color = randomColorsChosen[chan][name];
    }
    else {
        color = defaultColors[Math.floor(Math.random()*defaultColors.length)];
        randomColorsChosen[chan][name] = color;
    }
    return color;
}

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

socket.on('twitch message', appendTwitchMessage); // Needs better naming...
socket.on('chat message', appendTwitchMessage);

// client has to be initialized with streamer's oauth!
// client.on('chat', receiveTwitchMessage);

function appendTwitchMessage(msg) {
    $('#messages').append(
        $('<li>').append(
            $('<span>').attr('style', msg[0]).text(msg[1]).append(
                $('<span>').attr('style', "color:black").text(msg[2])
            )
        )
    )
}

// function receiveTwitchMessage(channel, user, message, self) {
//     var color = resolveColor(channel, user['display-name'], user['color']);
//     io.emit('twitch message', ["color:" + color, user['display-name'], ": " + message]);    
// }

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
    var m = 5
    if (user.x >= width - m) {
        user.x = width - m;
    }else if (user.x <= m) {
        user.x = m;
    }

    if (user.y > height - m) {
        user.y = height - m;
    } else if (user.y <= m) {
        user.y = m;
    }

    socket.emit('player: move', {x: user.x, y: user.y});
}
handleMovement();

addUserInfo();
function addUserInfo(){
    $("#"+user.twitch_id).hover(function(){
    playerInfoHtml = ("<b>ID: </b> " + user.twitch_id +"<br><b>username: </b>" + user.twitch_username +
        "<br><b>last seen: </b> 5 sec ago<br><b>tags: </b>LOL DotA2 GTAV")
    $("#player-info").html(playerInfoHtml);
    $("#player-info").css({
        left: user.x + 25,
        top:  user.y
    });

        $("#player-info").show();
    }, function(){
        $("#player-info").hide();
    });
}

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
    // <div id="player-info" class = "hide">Some information to be displayed.</div>
    return $("<div id=\'"+user.twitch_id+"\' class=\'player\' style=\'left:"+user.x+"; top:"+user.y+"; background-color: "+color+"\'><ul class=\'localmsgs\'></ul></div>");
}
