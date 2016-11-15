// TODO: authenticate user for twitch requests.

var access_token, twitch_id;

Twitch.init({ clientId: 'oqg26g9cdo8gkqy7puez3370gudujjk'}, function(err, status) { console.log('the library is now loaded') });

if (hasAuthenticated()) {
    Twitch._config.session = {};
    Twitch._config.session.token = access_token;
    Twitch._config.session.scope = ["user_read", "channel_read"];
} else {
    $('#twitchsdk').click(function() {
    Twitch.login({
        redirect_uri:'http://localhost:3000/test',
        scope: ['user_read', 'channel_read']
        });
    })
}

function hasAuthenticated() {
    access_token = localStorage.getItem('lounge_token');
    twitch_id = localStorage.getItem('twitch_id');
    return access_token != null && twitch_id != null;
}

// function findUser() {
//     $.ajax({
//         url: '/db/findUser',
//         type: 'GET',
//         data: {
//         "twitch_id" : twitch_id,
//         "token" : access_token
//         },
//         success: function(data) {
//             Twitch.api({method: 'streams/' + data.twitch_username}, function(error, stream) {
//                 if (stream.stream) {
//                     $("body").append("<p>STREAMER!</p>");
//                 } else {
//                     $("body").append("<p>WATCHER!</p>");
//                 }
//                 debugger;
//             })
//         }
//     })
// }

// TODO: Ask group.. how do I stream lmao
// Then: Show diff pages based on if streaming or not
// If streaming, create a room with a unique URL string
// For users, add a route for probably ... /lounge + said string, see Express Routing to allow that behavior
// For those people, assign them to a namespace socket room based on that string, which acts as a lounge ID


