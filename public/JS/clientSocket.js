// ------------------------------------------------------------
// INITIALIZATION AND GLOBALS

// Get the lounge code from URL and register socket to namespace
var namespace = window.location.pathname;
var socket = io(namespace);

// Variables
var twitch_id, access_token;
var user, playerAvatar;
var nearbyUserSets = []; // Array of users who are near this user

var viewportWidth, viewportHeight; // Of the "left" div where lounge is located

var zoom = 1; // Zoom level, min 1 (100%), goes up to 4 (400%)

$(document).ready(function() {
    if (hasAuthenticated()) {
        socket.emit('player: start', {access_token: access_token, twitch_id: twitch_id})
    } else { lurk(); }

    viewportWidth = $("#left")[0].getBoundingClientRect().width;
    viewportHeight = $("#left")[0].getBoundingClientRect().height;

    $("#show-user-setup").click(function() {
        $("#user-setup").toggleClass("hide");
    })

})

socket.on('player: add self', function(row) {
    user = row; // Server sends us our full user obj
    $("#"+user.twitch_id).remove(); // Just in case of refresh duplication
    playerAvatar = createPlayerEl(user);
    playerAvatar.addClass("player-avatar");
    $("#players").append(playerAvatar);

    addPlayerEvents();
    loadStreamerOptions();
})



// ------------------------------------------------------------
// USER EVENT HANDLING
// For event listeners that HAVE to be initialized AFTER an authenticated user is made

function addPlayerEvents() {

var velX = 0,
    velY = 0,
    speed = 2,
    friction = .9,
    keys = [];

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

    // acceleration and friction
    velY *= friction;
    user.y += velY;
    velX *= friction;
    user.x += velX;

    //edges detected
    var m = 5;
    if (user.x >= lounge.width - m) {
        user.x = lounge.width - m;
    }else if (user.x <= m) {
        user.x = m;
    }

    if (user.y > lounge.height - m) {
        user.y = lounge.height - m;
    } else if (user.y <= m) {
        user.y = m;
    }

    socket.emit('player: move', {x: user.x, y: user.y});

}
handleMovement();

addUserInfo();
function addUserInfo(){
    // This function adds a bubble that display username, twitch id, etc
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

function handleZoom() {
    zoom = parseFloat($(this).val());

    $("#floor").css("width", lounge.width * zoom);
    $("#floor").css("height", lounge.height * zoom);

    // Players are 15x15 when 100%
    $(".player").each(function() {
        $(this).css("width", (15 * zoom) + "px");
        $(this).css("height", (15 * zoom) + "px");
        $(this).css("box-shadow", '0px 0px ' + (25*zoom)+'px '+ (25*zoom) +'px' + '#eeeeee');


        var prevx = $(this).attr("data-x");
        var prevy = $(this).attr("data-y");
        $(this).css("left", prevx * zoom);
        $(this).css("top", prevy * zoom);
    })

    $(this).blur(); // Remove focus so arrow keys don't change zoom value
}
$("input.zoomer").change(handleZoom);

function handleUserSetup() {
    $("#user-setup .not-logged-in").remove();
    $("#user-setup input[name=color]").val(user.color);
    $("#user-setup input[name=sprite][value="+user.sprite+"]").attr('checked', 'checked');

    $("#user-setup form").submit(function() {
        quickSaveUser();
        return false;
    })
    function quickSaveUser() {
        var color = $("#user-setup input[name=color]").val();
        var sprite = $("#user-setup input[name=sprite]:checked").val()
        $.ajax({
            url: '/db/quickSaveUser',
            type: 'PUT',
            data: {
                "twitch_id" : user.twitch_id,
                "access_token" : user.access_token,
                "color" : color,
                "sprite" : sprite
            },
            success: function(result) {
                $("#user-setup").addClass("hide");
                playerAvatar.css("background-color", "#" + color);
                // EMIT COLOR CHANGE TO EVERYONE?
            },
            error: function() { alert("Error saving player"); }
        })
    }
}
handleUserSetup();

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

    // var msgLi = $("<li><b style=\"color:#"+sourceUser.color+"\">"+sourceUser.twitch_username + ":</b> " + msg+"</li>");

    var msgLi = $("<li><b style=\"color:#"+sourceUser.color+"\">"+sourceUser.twitch_username + ": </b>" + twitchEmoji.parse((msg),{emojiSize : 'small'})+"</li>");
    var emote = twitchEmoji.parse((msg),{emojiSize : 'small'}).match(/<img[^>]+>/);
    if (emote && (emote.length > 0))
    {
        var curEmote = $("#"+sourceUser.twitch_id+" li");
        if(curEmote.length > 0)
            curEmote[0].remove();
        var emoteAvatar = $("<li>"+emote[0]+"</li>");
        $("#"+sourceUser.twitch_id).append(emoteAvatar);
        setTimeout(function(){
            emoteAvatar.remove();
        }, 3000);
    }

    // Old code that had message appear near user's avatar.
    // Could be reworked into an emote when chat sent
    // var fadeTime = (msg.length/20)*1000; // Assuming people read at an average of 15 characters per second...
    // $("#"+sourceUser.twitch_id+" .localmsgs").append(msgLi);
    // setTimeout(function(){
    //     msgLi.fadeOut(400, function() {
    //         msgLi.remove();
    //     })
    // }, 1500 + fadeTime);

    var localChatBox = $("#local-messages-history");
    localChatBox.append(msgLi);
    

    // check if the message is sent out by the user themselves
    if (sourceUser.twitch_id == twitch_id) {
        msgLi.addClass("self-messages");
    } else {
        setTimeout(function () {
        msgLi.css("background-color", "rgba(255,255,255,0)");
    }, 220);
        setTimeout(function () {
        msgLi.css("background-color", "rgba(255,255,255,0.6)");
    }, 320);
    }

    // remove the oldest history if the history is more than, say, 500
    var totalLength = $("#local-messages-history li").length;
    if ( totalLength > 500) {
        $('#local-messages-history li').first().remove();
    }

    localChatBox.animate({scrollTop: localChatBox[0].scrollHeight}, 200); // Scroll to bottom
}


} // Close addPlayerEvents()



// ------------------------------------------------------------
// ANON/USER EVENT HANDLING
// For event listeners that happen whenever, and everyone can enjoy its effects

function lurk() {
    $("#user-setup .logged-in").remove();
    socket.emit('anon: get all');
}

// *** Add your own socket listeners below *** //

socket.on('player: get all', getAllUsers);
function getAllUsers(otherUsers) {
    $.each(otherUsers, function(index, otherUser) {
        $("#players").append(createPlayerEl(otherUser));
    })
}

socket.on('players: update all', handleUpdate);
function handleUpdate(res) {
    moveAllUsers(res.allUsers);
    if (user) {
        centerOnUser(); // NOTE: Tiny visual bug where centered user position "snaps back" during movement
        updateNearby(res.listeningRange);
    }
}
function moveAllUsers(allUsers) { // Moves all users to updated positions gotten from server
    $.each(allUsers, function(index, otherUser) {
        $("#"+otherUser.twitch_id).attr("data-x", otherUser.x);
        $("#"+otherUser.twitch_id).attr("data-y", otherUser.y);

        $("#"+otherUser.twitch_id).css("left", otherUser.x * zoom);
        $("#"+otherUser.twitch_id).css("top", otherUser.y * zoom);
    })
}
function updateNearby(listeningRanges) { // Visualizes who is nearby for this socket's user
    // Unless someone enters RIGHT as someone leaves, this check is faster than checking contents of array
    if (nearbyUserSets.length !== listeningRanges[user.twitch_id].length) {
        $(".player .player-overlay").removeClass("listening");
        nearbyUserSets = listeningRanges[user.twitch_id];
        $.each(nearbyUserSets, function(index, otherUserSet) { // Show people who are nearby
            $("#"+otherUserSet.twitch_id + " .player-overlay").addClass("listening");
        })
    }
}

socket.on('player: add newcomer', function(otherUser) {
    $("#players").append(createPlayerEl(otherUser));
})

socket.on('player: leave', function(otherUser) {
    $("#"+otherUser.twitch_id).remove();
})

// Handle centering on user
// Stored width and height of the 'viewing area' to save on recalculations
$(window).resize(function() { // Reset if the user resizes their window
    viewportWidth = $("#left")[0].getBoundingClientRect().width;
    viewportHeight = $("#left")[0].getBoundingClientRect().height;
})
function centerOnUser() {
    $("#floor").css("left", ((viewportWidth / 2.0) - (user.x * zoom) + (15*zoom /2.0) + "px"));
    $("#floor").css("top", ((viewportHeight / 2.0) - (user.y * zoom) - (15*zoom /2.0) + "px"));
}



// ------------------------------------------------------------
// STREAMER USER EVENT HANDLING
// Remove and hide things only streamers need

function loadStreamerOptions() {
    if ("/" + user.twitch_username === namespace) {
        $("#show-setup").show();
    } else {
        $("#show-setup").remove();
        $("#setup").remove();
    }
}



// ------------------------------------------------------------
// UTILITY FUNCTIONS


function createPlayerEl(user) { // Element appended when a new player enters
    if (typeof user.color === "undefined") { // Here temporarily to deal w/ legacy users in DB...
        user.color = randomColor();
    }
    return $("<div id=\'"+user.twitch_id+"\' class=\'player\' data-x=\'"+user.x+"\' data-y=\'"+user.y+"\' style=\'left:"+ (user.x*zoom) +"px; top:"+ (user.y*zoom) +"px;\'>"+
                "<div class=\"player-overlay\"></div>" +
                "<div class=\"player-sprite\" style=\'filter: "+calculateColorFilter(user.color)+"; background-image: url(\"../assets/sprites/userSprites/userSprite_"+user.sprite+".png\");\'></div>" + 
                "</div>");
}

function getUser() {
    return user;
}

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

// Given a user color, calculates the different of hue, saturation, and light between color and sprite base color
// and returns a string that can be used for the filter param
function calculateColorFilter(color) {
    var spriteBase = "f89850"; // Assumes a base color of a reddish orange
    var spriteHSL = hexToHsl(spriteBase);
    var targetColorHSL = hexToHsl(color); // User's selected color HSL

    var hueDeg = Math.abs(spriteHSL[0]-targetColorHSL[0]);
    var saturate = 100 + (spriteHSL[1] - targetColorHSL[1]);
    var lightness = 100 + (spriteHSL[2] - targetColorHSL[2]);
    return "hue-rotate("+hueDeg+"deg) saturate("+saturate+"%) brightness("+lightness+"%);"
}

// Given hex code in a string (with or without #) converts to HSL
function hexToHsl(hex) {
    var rgb = hexToRgb(hex);
    return rgbToHsl(rgb.r, rgb.g, rgb.b);

}

// http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// http://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work/2348659#2348659
// RGB to hue, saturation, light [hue, sat, light]
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}