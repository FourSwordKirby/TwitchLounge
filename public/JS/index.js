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
                $("#first-time").addClass('hide');
                $("#second-visit").removeClass('hide');
                $("span#twitch-username").html(data.twitch_username);
                $("#second-visit .purpleButton").attr("href", "/"+data.twitch_username);
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
    $("#first-time").removeClass("hide");

    var clientId, redirect_uri;
    if (window.location.hostname === "localhost") {
        clientId = "oqg26g9cdo8gkqy7puez3370gudujjk";
        redirect_uri = "http://localhost:3000/setup/authenticate";
    } else {
        clientId = "o3e1g0l03l181jx7b5ww5fs166a5xwg";
        redirect_uri = "https://obscure-oasis-50526.herokuapp.com/setup/authenticate";
    }

    Twitch.init({ clientId: clientId}, function(err, status) { console.log('Loaded Twitch SDK') });
    $('#twitch-auth').click(function() {
        Twitch.login({
            redirect_uri: redirect_uri,
            scope: ['user_read', 'channel_read']
        });
    })
}