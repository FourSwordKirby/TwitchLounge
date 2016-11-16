"use strict";

// Every user can potentially have one lounge. 1-1 relationship
class Lounge {

    constructor(twitch_id, twitch_username, tmi_apikey) {
        this.twitch_id = twitch_id; // Twitch ID of user owning room
        this.twitch_username = twitch_username;
        this.tmi_apikey = tmi_apikey; // API key for https://twitchapps.com/tmi/ utilized to get/post chat messages IRC
    }

    jsonify() {
        return {
            "twitch_id" : this.twitch_id,
            "twitch_username" : this.twitch_username,
            "tmi_apikey" : this.tmi_apikey
        }
    }

}

module.exports = Lounge;