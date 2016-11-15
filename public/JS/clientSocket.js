
// Get the lounge code from URL and register socket to namespace
var namespace = window.location.pathname;
var socket = io(namespace);

socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
});

socket.on('twitch message', function(msg){
    $('#messages').append(
        $('<li>').append(
            $('<span>').attr('style', msg[0]).text(msg[1]).append(
                $('<span>').text(msg[2])
            )
        )
    )
});



// WIP below

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

    socket.on('player: get all', function(otherUsers) {
    debugger;
})

})

socket.on('player: add self', function(user) {
    user = user;
    $("#"+user.twitch_id).remove();
    playerAvatar = $("<div id=\'"+user.twitch_id+"\' class=\'player\' style=\'x:"+user.x+"; y:"+user.y+";\'></div>");
    $("#players").append(playerAvatar);
})

// socket.on('player: get all', function(otherUsers) {
//     debugger;
// })


function lurk() {} // TODO

function hasAuthenticated() {
    access_token = localStorage.getItem('lounge_token');
    twitch_id = localStorage.getItem('twitch_id');
    return access_token != null && twitch_id != null;
}


