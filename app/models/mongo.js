
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongoDB; // The database

var url = 'mongodb://127.0.0.1:27017/lounge'; // Default to localhost connection
// TODO on deploy: Change URL dynamically in connect once we deploy

// Opens connection to database
function connect(queryFunction) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        queryFunction(db);
    });
}

// Test database connection
exports.testConnect = function() {
    console.log("MongoDB: " + url);
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server.");
        db.close();
    });
}

// Pass it a user object and it will save it
exports.insertUser = function(user) {
    connect(function(db) {
        db.collection('users').insertOne(user.jsonify(), function(err, result) {
        assert.equal(err, null);
        console.log("Inserted "+ user.twitch_username +" into the DB.");
        db.close();
        })
    })
}

// Returns first user that matches the following ID and access token
exports.getUser = function(twitch_id, access_token, callback) {
    connect(function(db) {
        db.collection('users').findOne({"twitch_id" : twitch_id, "access_token" : access_token}, function(err, doc) {
            callback(doc);
        });
        db.close();

    })
}

exports.updateUser = function() {
    
}

exports.getAllUsers = function() {
}

// Deletes all users, probably used just for testing purposes
exports.deleteAllUsers = function(callback) {
    connect(function(db) {
        db.collection('users').deleteMany( {}, function(err, results) {
            db.close;
            callback(results);
        })
    })
}

 
