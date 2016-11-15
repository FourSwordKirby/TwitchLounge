
var MongoDB = require('./models/mongo.js');
var User = require('./models/user.js');

// Assumes twitch user OBJ in req as user
exports.saveUser = function(req, res) {
    var user = new User(req.body.user._id, req.body.user.name, req.body.user.logo, req.body.user.bio, req.body.token);
    MongoDB.insertUser(user);
    res.json(user.jsonify());
    // res.end("Saved user " + req.body.user.display_name + " to DB, cleared to start session.");
}

// Assumes GET with two query params: Twitch ID and access token, used together to uniquely
// identify a user and give then a 'session' (not really but essentially...)
exports.findUser = function(req, res) {
    MongoDB.getUser(req.query.twitch_id, req.query.token, function(row) {
        if (row !== null) {
            var user = new User(row.twitch_id, row.twitch_username, row.twitch_avatar, row.twitch_bio, row.access_token);
            res.json(user.jsonify());
        } else { // No row found, send back error
            res.status(500);
            res.end("No user found");
        }
    })
}