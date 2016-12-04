// TODO: authenticate user for twitch requests.

var access_token, twitch_id;
var namespace = window.location.pathname;

// lounge replaced when lounge loads, but set width and height to prevent errors with initial edge detection
var lounge = {"width" : 500, "height" : 500};

Twitch.init({ clientId: 'oqg26g9cdo8gkqy7puez3370gudujjk'}, function(err, status) { console.log('the library is now loaded') });

getLounge();

if (hasAuthenticated()) {
    Twitch._config.session = {};
    Twitch._config.session.token = access_token;
    Twitch._config.session.scope = ["user_read", "channel_read"];
} else {
    // Lurk
}

// Find the right method, call on correct element
// copied from stackoverflow...
function launchFullScreen(element) {
  if(element.requestFullScreen) {
    element.requestFullScreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
}

$(document).ready(function() {

    // Embed twitch stream
    var options = {
            width: "100%",
            height: $("#video").height(),
            channel: namespace.slice(1)
    };
    
    // Commented out for now just because it causes our debug log to be noisy af
    var player = new Twitch.Player("twitch-stream", options);
    player.setVolume(0);
    
    var chatFrame = document.createElement('iframe');
    chatFrame.setAttribute("src", "http://www.twitch.tv/" + namespace.slice(1) + "/chat");
    chatFrame.setAttribute("id", "chat_embed");
    chatFrame.setAttribute("frameborder", "0");
    chatFrame.style.height = "99%";
    chatFrame.style.width = "100%";        
    
    //Embed twitch chat
    document.getElementById("chatroom").appendChild(chatFrame);

    // Streamer setup listeners (close-setup reused for user setup forms)
    $(".close-setup").click(function() {
        $(this).parent().addClass("hide");
        return false;
    })
    $("#show-setup").click(function() {
        $("#setup").toggleClass("hide");
        return false;
    })
    $("#setup form").submit(function() {
        saveLounge();
        return false;
    })

    $('#show-help').hover(function () {
        $(".middle-float-window").toggleClass("hide");
    })

    $('#show-fullscreen').click(function () {
        launchFullScreen(document.body);
        $("#video").height($("#twitch-stream").height());
        $("#chatroom").height(screen.height - $("#twitch-stream").height());
    })


})

// ------------------------

function hasAuthenticated() {
    access_token = localStorage.getItem('lounge_token');
    twitch_id = localStorage.getItem('twitch_id');
    return access_token != null && twitch_id != null;
}

// ------------------------
// Streamer lounge setup

function saveLounge() {
    var tmikey = $("#setup input[name=tmi]").val();
    var width = $("#setup input[name=width]").val();
    var height = $("#setup input[name=height]").val();
    $.ajax({
        url: '/db/saveLounge',
        type: 'PUT',
        data: {
            "access_token" : access_token,
            "twitch_id" : twitch_id,
            "tmikey" : tmikey,
            "width" : width,
            "height" : height
        },
        success: function(result) {
            if (result === "Update") {

            } else {

            }
        }
    }).done(function() {
        $("#setup").addClass("hide");
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
            $(document).ready(function() {
                $("#setup input[name=tmi]").val(result.tmi_apikey);
                $("#setup input[name=width]").val(result.width);
                $("#setup input[name=height]").val(result.height);

                $("#floor").css("width", result.width);
                $("#floor").css("height", result.height);
            })
        },
        error: function() {
            $("#floor").css("width", 500);
            $("#floor").css("height", 500);
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