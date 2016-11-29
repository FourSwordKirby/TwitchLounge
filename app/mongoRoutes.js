
var MongoDB = require('./models/mongo.js');
var User = require('./models/user.js');
var Lounge = require('./models/lounge.js');

// Assumes twitch user OBJ in req as user
exports.saveUser = function(req, res) {
    if (typeof req.body.user._id === "undefined") {
        res.status(500);
        res.end("No user found");
    } else {
        MongoDB.getUser({"twitch_id" : req.body.user._id}, function(row) {
            if (row !== null) { // Update. Note: $set used to allow adding of new cols
                MongoDB.updateUser(req.body.user._id, {$set: {"twitch_username" : req.body.user.name, "twitch_avatar" : req.body.user.logo, "twitch_bio" : req.body.user.bio, "access_token": req.body.token}});
                res.send({"type" : "Update", "twitch_id" : row.twitch_id});
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

// First checks twitch ID and access token validity before updating
exports.saveLounge = function(req, res) {
    if (typeof req.body.twitch_id === "undefined") {
        res.status(500);
        res.end("No user found, failed to save lounge");
    } else {
        MongoDB.getUser({"twitch_id" : req.body.twitch_id, "access_token" : req.body.access_token}, function(user) {
            if (user !== null) {
                MongoDB.getLounge({"twitch_id" : req.body.twitch_id}, function(lounge) {
                    if (lounge !== null) { // Update
                        MongoDB.updateLounge(req.body.twitch_id, {$set: {"twitch_username": user.twitch_username, "tmi_apikey" : req.body.tmikey, "width" : req.body.width, "height" : req.body.height} });
                        res.send("Update");
                    } else { // Insert
                        var lounge = new Lounge(req.body.twitch_id, user.twitch_username, req.body.tmikey);
                        lounge.resize(req.body.width, req.body.height);
                        MongoDB.insertLounge(lounge);
                        res.json(lounge.jsonify());
                    }
                })
            }
        })
    }
}

// Given the host streamer's username, tries to find the room for a user
exports.findLounge = function(req, res) {
    MongoDB.getLounge({"twitch_username" : req.query.streamer_username}, function(lounge) {
        if (lounge !== null) {
            var found_lounge = new Lounge(lounge.twitch_id, lounge.twitch_username, lounge.tmi_apikey);
            found_lounge.resize(lounge.width, lounge.height);
            res.json(found_lounge.jsonify());
        } else {
            res.status(500);
            res.end("No lounge found");
        }
    })
}
