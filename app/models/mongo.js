
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongoDB; // The database

var url = 'mongodb://127.0.0.1:27017/lounge'; // Default to localhost connection
if (process.env.PORT) {
    url = "mongodb://heroku_pk134lvl:amdr2f04nfafg40dodk8kglj0n@ds119718.mlab.com:19718/heroku_pk134lvl"
}

// Opens connection to database
function connect(queryFunction) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        queryFunction(db);
    });
}

// Test database connection
exports.testConnect = function() {
    console.log("Using MongoDB: " + url);
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("MongoDB: Connected correctly to database server.");
        db.close();
    });
}

// --------------------------------------------------
// USER

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

// Returns first user that matches
// Search params in format of {"twitch_id" : value, ... }
exports.getUser = function(searchParams, callback) {
    connect(function(db) {
        db.collection('users').findOne(searchParams, function(err, doc) {
            assert.equal(err, null);
            callback(doc);
        });
        db.close();
    })
}

// Given twitch ID, updates a user obj based on update_data. You can put whatever you want in update_data so long it is
// a dictionary {} but only the keys listed in user will actually be used in model functionality
exports.updateUser = function(twitch_id, update_data) {
    connect(function(db) {
        db.collection('users').update({"twitch_id" : twitch_id}, update_data, {upsert: false, multi: false}, function(err, doc) {
            assert.equal(err, null);
            console.log("Updated user in the DB.");
            db.close();
        })
    })
}

// Deletes all users, probably used just for testing purposes
exports.deleteAllUsers = function(callback) {
    connect(function(db) {
        db.collection('users').deleteMany( {}, function(err, results) {
            db.close();
            callback(results);
        })
    })
}

// --------------------------------------------------
// LOUNGE
 
 // Pass it a lounge object and it will save it
exports.insertLounge = function(lounge) {
    connect(function(db) {
        db.collection('lounges').insertOne(lounge.jsonify(), function(err, result) {
            console.log("Inserted lounge into the DB.");
            db.close();
        })
    })
}

// Using the twitch id and access token to authenticate a user's identity, updates a lounge
exports.updateLounge = function(twitch_id, update_data) {
    connect(function(db) {
        db.collection('lounges').update({"twitch_id" : twitch_id}, update_data, function(err, doc) {
            console.log("Updated lounge in DB");
        })
        db.close();
    })
}

// Returns first lounge that matches
// Search params in format of {"twitch_id" : value, ... }
exports.getLounge = function(searchParams, callback) {
    connect(function(db) {
        db.collection('lounges').findOne(searchParams, function(err, doc) {
            assert.equal(err, null);
            callback(doc);
        });
        db.close();
    })
}
