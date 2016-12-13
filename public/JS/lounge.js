
// Loaded on any lounge page

var access_token, twitch_id;
var namespace = window.location.pathname;

// lounge replaced when lounge loads, but set width and height to prevent errors with initial edge detection
var lounge = {"width" : 500, "height" : 500};
var zoom= 2.5;
Twitch.init({ clientId: 'oqg26g9cdo8gkqy7puez3370gudujjk'}, function(err, status) { console.log('the library is now loaded') });

getLounge();

if (hasAuthenticated()) {
    Twitch._config.session = {};
    Twitch._config.session.token = access_token;
    Twitch._config.session.scope = ["user_read", "channel_read"];
} else {
    // Lurk
}

var fullScreenNofificationSent = false

// http://stackoverflow.com/questions/21280966/toggle-fullscreen-exit
function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }

    if (!fullScreenNofificationSent) {
        $("#local-messages-history").prepend('<li><span class=\"msg-body\">Please use the fullscreen button at the top to exit full screen. Do not use the Esc key.</span><div class=\"msg-bg\"></div></li>');
        fullScreenNofificationSent = true;
    }

    $("#chatroom").height(screen.height - $("#twitch-stream").height());
    $("body").height(screen.height);
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    $("body").css("height", "100vh");
    $("#chatroom").css("height","50vh"); // hard coded for now.
    // $("#chatroom").css("height",$(window).height() - $("#twitch-stream").height());
  }
}


$(document).ready(function() {

    // Embed twitch stream
    var options = {
            width: "100%",
            height: $("#video").height(),
            channel: namespace.slice(1)
    };
    var player = new Twitch.Player("twitch-stream", options);
    player.setVolume(0);

    // dynamically resize video player height
    window.onresize = function (){
        var player = $("iframe[src*='https://player.twitch.tv/?channel=" + namespace.slice(1) + "']");
        player[0].setAttribute("height", $("#video").height());
    }

    var chatFrame = document.createElement('iframe');
    chatFrame.setAttribute("src", "https://www.twitch.tv/" + namespace.slice(1) + "/chat");
    chatFrame.setAttribute("id", "chat_embed");
    chatFrame.setAttribute("frameborder", "0");
    chatFrame.style.height = "100%";
    chatFrame.style.width = "100%";

    // Twitch chat loading in takes awhile. To make transition smoother, added a loading screen
    // Upon twitch chat finishing, fadeout loading screen
    chatFrame.onload = function() {
        $('#loading-screen').addClass('animated fadeOut').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $("#loading-screen").remove();
        });
    };
    
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
        $(".hidden-instruction").toggleClass("hide");
    })

    $('#show-fullscreen').click(function () {
        toggleFullScreen();
        $("#video").height($("#twitch-stream").height());
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

                $("#floor").css("width", result.width*zoom);
                $("#floor").css("height", result.height*zoom);

            })
        },
        error: function() {
            $("#floor").css("width", (500*zoom)+ " px");
            $("#floor").css("height", (500*zoom)+ " px");
        }
    })
}
