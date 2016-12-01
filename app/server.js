
// Loading server modules
var express = require('express'); // Web framework
var app = express(); // Our actual app running on framework
var http = require('http').Server(app);
var morgan = require('morgan'); // Middleware logging
var io = require('socket.io')(http); // Enables web sockets
var path = require('path');
var fs = require("fs"); // File System
var tmi = require('tmi.js'); // Twitch IRC
var bodyParser = require('body-parser'); // Enables grabbing PUT/POST query params

// Configuring server modules
app.use(morgan('tiny')); // How the log messages in our terminal appear as stuff happens to our server
app.use( bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Loading models and other handlers
var ServerSocket = require('./serverSocket.js');
var MongoRoutes = require('./mongoRoutes.js');

// Handle static files
app.use(express.static('public'))

// ------------------------------------------------------------------
// SOCKET STUFF

// Namespacing lounges
var lounges = [];
app.get('/:loungename', function (req, res) {
    if (typeof req.params === undefined) {
        console.log("No lounge name or code");
        res.end();
    } else {
        console.log(req.params);
        if (path.extname(req.params.loungename).length <= 1) { // Don't make lounge for .ico, etc
            if (lounges.indexOf(req.params.loungename) === -1) { // Prevent duplication of lounge code initialization
                ServerSocket.handleConnections(io, req.params.loungename);
                lounges.push(req.params.loungename);
                // TODO: Close the room functionality
            }
            res.sendFile(path.join(__dirname, '../public', 'lounge.html'));
        }
    }
})

app.get('/setup/authenticate', function (req, res) {
    res.sendFile(path.join(__dirname, '../public/setup', 'authenticate.html'))
})

// ------------------------------------------------------------------
// Mongo Database
app.put('/db/saveUser', MongoRoutes.saveUser);
app.get('/db/findUser', MongoRoutes.findUser);
app.put('/db/quickSaveUser', MongoRoutes.quickSaveUser);
app.put('/db/saveLounge', MongoRoutes.saveLounge);
app.get('/db/findLounge', MongoRoutes.findLounge);

app.use(function (req, res, next) {
    res.status(404).send('404: Sorry cant find that!')
})

// This literally starts the server
http.listen(3000, function(){
  console.log('listening on *:3000');
});

