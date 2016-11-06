
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
        console.log("Inserted "+ user.username +" into the DB.");
        db.close();
        })
    })
}

// Returns the first user with a username
exports.getUser = function(username, callback) {
    connect(function(db) {
        var cursor = db.collection('users').find({"username" : username});
        cursor.each(function(err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                callback(doc);
            }
            db.close();
            return;
        })
    })
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

 
