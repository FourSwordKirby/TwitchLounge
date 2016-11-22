
// Get the lounge code from URL and register socket to namespace
var namespace = window.location.pathname;
var socket = io(namespace);

// Variables
var twitch_id, access_token;
var user, playerAvatar;

// Load TMI
var options = {
    options: {
        debut: true
    },
    connection: {
        cluster: "aws",
        recconect: true
    },
    identity: {
        username: keys["Twitch"]["username"],
        password: keys["Twitch"]["password"]
    },
    channels: ["mossyqualia"]
};

var client = new tmi.client(options);
client.connect();

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

client.on('chat', function(channel, user, message, self) {
    var color = resolveColor(channel, user['display-name'], user['color']);
    io.emit('twitch message', ["color:" + color, user['display-name'], ": " + message]);
});

client.on('connected', function(address, port) {
    io.emit('chat message', "My nipples look like milk duds");
  });

socket.on('twitch message', function(msg){
    $('#messages').append(
        $('<li>').append(
            $('<span>').attr('style', msg[0]).text(msg[1]).append(
                $('<span>').attr('style', "color:black").text(msg[2])
            )
        )
    )
});

socket.on('player: get all', function(otherUsers) {
    $.each(otherUsers, function(index, user) {
        $("#players").append($("<div id=\'"+user.twitch_id+"\' class=\'player\' style=\'x:"+user.x+"; y:"+user.y+";\'></div>"));
    })
})

socket.on('player: add self', function(user) {
    user = user; // Server sends us our full user obj
    $("#"+user.twitch_id).remove(); // Just in case of refresh duplication
    playerAvatar = $("<div id=\'"+user.twitch_id+"\' class=\'player\' style=\'x:"+user.x+"; y:"+user.y+";\'></div>");
    $("#players").append(playerAvatar);
})

// -------------------------------------------------------
// Supporting functions

function lurk() {} // TODO

function hasAuthenticated() {
    access_token = localStorage.getItem('lounge_token');
    twitch_id = localStorage.getItem('twitch_id');
    return access_token != null && twitch_id != null;
}
