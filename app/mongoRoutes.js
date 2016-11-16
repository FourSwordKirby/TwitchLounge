
var MongoDB = require('./models/mongo.js');
var User = require('./models/user.js');

// Assumes twitch user OBJ in req as user
exports.saveUser = function(req, res) {
    if (typeof req.body.user._id === "undefined") {
        res.status(500);
        res.end("No user found");
    } else {
        MongoDB.getUser({"twitch_id" : req.body.user._id}, function(row) {
            if (row !== null) { // Update
                MongoDB.updateUser(req.body.user._id, {$set: {"twitch_username" : req.body.user.name, "twitch_avatar" : req.body.user.logo, "twitch_bio" : req.body.user.bio, "access_token": req.body.token}});
                res.send("Update");
            } else { // Insert
                var user = new User(req.body.user._id, req.body.user.name, req.body.user.logo, req.body.user.bio, req.body.token);
                MongoDB.insertUser(user);
                res.json(user.jsonify());
            }
        })
    }
}

// Assumes GET with two query params: Twitch ID and access token, used together to uniquely
// identify a user and give then a 'session' (not really but essentially...)
exports.findUser = function(req, res) {
    MongoDB.getUser({"twitch_id" : req.query.twitch_id, "access_token" : req.query.token}, function(row) {
        if (row !== null) {
            var user = new User(row.twitch_id, row.twitch_username, row.twitch_avatar, row.twitch_bio, row.access_token);
            res.json(user.jsonify());
        } else { // No row found, send back error
            res.status(500);
            res.end("No user found");
        }
    })
}