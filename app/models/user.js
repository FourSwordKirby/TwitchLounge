"use strict";

// Like objects in other programming languages. You can create a new user via 'new User(...);'
// Note the module.exports on the bottom. This is what allows us to control what comes out
// when someone else attempts to use the code in here in another file via 'var User = require('./models/user.js');'

class User {

    // Users are made after authentication with Twitch and then are mainly gotten and created
    // via database calls
    constructor(twitch_id, twitch_username, twitch_avatar, twitch_bio, access_token) {
        this.twitch_id = twitch_id;
        this.twitch_username = twitch_username;
        this.twitch_avatar = twitch_avatar;
        this.twitch_bio = twitch_bio;
        this.access_token = access_token;

        this.x = 0; // Default position to 0
        this.y = 0;
        this.socket = ""; // Socket ID used to target events to user
    }
    
    move(x, y) {
        this.x = x;
        this.y = y;
    }

    jsonify() { // Used to save into DB as a JSON object
        return {
            "twitch_id" : this.twitch_id,
            "twitch_username" : this.twitch_username,
            "twitch_avatar" : this.twitch_avatar,
            "twitch_bio" : this.twitch_bio,
            "access_token" : this.access_token,
            "x" : this.x,
            "y" : this.y,
            "socket" : this.socket
        }
    }

    siojsonify () { // Used to pass public information between sockets
        return {
            "twitch_id" : this.twitch_id,
            "twitch_username" : this.twitch_username,
            "twitch_avatar" : this.twitch_avatar,
            "twitch_bio" : this.twitch_bio,
            "x" : this.x,
            "y" : this.y
        }
    }

}

module.exports = User;