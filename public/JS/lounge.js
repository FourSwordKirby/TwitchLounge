// TODO: authenticate user for twitch requests.

var access_token, twitch_id;
var namespace = window.location.pathname;
var lounge;

Twitch.init({ clientId: 'oqg26g9cdo8gkqy7puez3370gudujjk'}, function(err, status) { console.log('the library is now loaded') });

getLounge();

if (hasAuthenticated()) {
    Twitch._config.session = {};
    Twitch._config.session.token = access_token;
    Twitch._config.session.scope = ["user_read", "channel_read"];
} else {
    // Lurk
}


$(document).ready(function() {

    // Embed twitch stream
    var options = {
            width: 854,
            height: 480,
            channel: namespace.slice(1)
    };
    // Commented out for now just because it causes our debug log to be noisy af
    // var player = new Twitch.Player("twitch-stream", options);
    // player.setVolume(0.5);

    $("#setup form").submit(function() {
        saveLounge();
        return false;
    })

})

// ------------------------

function hasAuthenticated() {
    access_token = localStorage.getItem('lounge_token');
    twitch_id = localStorage.getItem('twitch_id');
    return access_token != null && twitch_id != null;
}

function saveLounge() {
    $.ajax({
        url: '/db/saveLounge',
        type: 'PUT',
        data: {
            "access_token" : access_token,
            "twitch_id" : twitch_id,
            "tmikey" : "TODO"
        },
        success: function(result) {
            if (result === "Update") {

            } else {

            }
        }
    }).done(function() {
    })
}

function getLounge() {
    $.ajax({
        url: '/db/findLounge',
        type: 'GET',
        data: {
            "streamer_username" : namespace.slice(1)
        },
        success: function(result) {
            lounge = result;
        },
        error: function() {

        }
    })
}

// Twitch.api({method: 'streams/' + data.twitch_username}, function(error, stream) {
//     if (stream.stream) {
//         $("body").append("<p>STREAMER!</p>");
//     } else {
//         $("body").append("<p>WATCHER!</p>");
//     }
// })