"use strict";

// Every user can potentially have one lounge. 1-1 relationship
class Lounge {

    constructor(twitch_id, twitch_username, tmi_apikey) {
        this.twitch_id = twitch_id; // Twitch ID of user owning room
        this.twitch_username = twitch_username;
        this.tmi_apikey = tmi_apikey; // API key for https://twitchapps.com/tmi/ utilized to get/post chat messages IRC

        this.width = 500; // Minimum size is 500 x 500
        this.height = 500;
    }

    resize(width, height) {
        if ((width >= 500) && (height >= 500)) {
            this.width = width;
            this.height = height;
        }
    }

    jsonify() {
        return {
            "twitch_id" : this.twitch_id,
            "twitch_username" : this.twitch_username,
            "tmi_apikey" : this.tmi_apikey,
            "width" : this.width,
            "height" : this.height
        }
    }

}

module.exports = Lounge;