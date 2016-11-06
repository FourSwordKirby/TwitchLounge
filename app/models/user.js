"use strict";

// Like objects in other programming languages. You can create a new user via 'new User(...);'
// Note the module.exports on the bottom. This is what allows us to control what comes out
// when someone else attempts to use the code in here in another file via 'var User = require('./models/user.js');'

class User {

    constructor(socket, username) {
        this.socket = socket; // SIO socket obj
        this.username = username; // Twitch username
        this.x = 0; // Default position to 0
        this.y = 0;
        this.accessToken = "";
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    jsonify() { // Used to save into DB as a JSON object
        return {
            "username": this.username,
            "x" : this.x,
            "y" : this.y,
            "accessToken" : this.accessToken
        }
    }

}

module.exports = User;