var twitch_id, access_token;

$(document).ready(function() {

    if (hasAuthenticated()) {
        // Find user object
        $.ajax({
            url: '/db/findUser',
            type: 'GET',
            data: {
                "twitch_id" : twitch_id,
                "token" : access_token
            },
            success: function(data) {
                $("#second-visit").show();
                $("span#twitch-username").html(data.twitch_username);
            },
            error: showFirstTime()
        })
    } else {
        showFirstTime();
    }

})

function hasAuthenticated() {
    access_token = localStorage.getItem('lounge_token');
    twitch_id = localStorage.getItem('twitch_id');
    return access_token != null && twitch_id != null;
}

function showFirstTime() {
    localStorage.removeItem('twitch_id');
    localStorage.removeItem('lounge_token');
    $("#first-time").removeClass("hide");


    Twitch.init({ clientId: 'oqg26g9cdo8gkqy7puez3370gudujjk'}, function(err, status) { console.log('Loaded Twitch SDK') });
    $('#twitch-auth').click(function() {
        Twitch.login({
            redirect_uri:'http://localhost:3000/setup/authenticate',
            scope: ['user_read', 'channel_read']
        });
    })
}