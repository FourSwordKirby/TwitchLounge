class User {

    constructor(socket, username) {
        this.socket = socket; // SIO socket obj
        this.username = username; // Twitch username
        this.x = 0; // Default position to 0
        this.y = 0;
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

}

module.exports = Point;