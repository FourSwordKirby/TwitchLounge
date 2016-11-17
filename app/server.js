
// Loading server modules
var express = require('express'); // Web framework
var app = express(); // Our actual app running on framework
var http = require('http').Server(app);
var morgan = require('morgan'); // Middleware logging
var io = require('socket.io')(http); // Enables web sockets
var path = require('path');
var fs = require("fs"); // File System
var tmi = require('tmi.js');
var bodyParser = require('body-parser'); // Enables grabbing PUT/POST query params

// Configuring server modules
app.use(morgan('tiny')); // How the log messages in our terminal appear as stuff happens to our server
app.use( bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Loading in secret keys
var keys = JSON.parse(fs.readFileSync("keys.json"));

// Loading models and other handlers
var ServerSocket = require('./serverSocket.js');
var MongoRoutes = require('./mongoRoutes.js');

// Handle static files
app.use(express.static('public'))
// app.use(express.static(__dirname + '/public'));

// Load TMI
var options = {
    options: {
        debut: true
    },
    connection: {
        cluster: "aws",
        recconect: true
    },
    identity: {
        username: keys["Twitch"]["username"],
        password: keys["Twitch"]["password"]
    },
    channels: ["mossyqualia"]
};

var client = new tmi.client(options);
client.connect();

// ------------------------------------------------------------------


// If you want to have the site respond to different URLS, simply follow the pattern above.
// You can also respond to - GET, PUT, POST, DELETE
// GET: When the user is requesting information
// PUT: When the user sends in something to update a file
// POST: When the user creates some new object in our DB
// DELETE: When the user attempts to delete some object
// For now, you can stick with GET

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
app.put('/db/saveLounge', MongoRoutes.saveLounge);
app.get('/db/findLounge', MongoRoutes.findLounge);


// ------------------------------------------------------------------
// Ralph's IRC Twitch chat code
// Send chat messages to socket

var defaultColors = [
        '#FF0000','#0000FF','#008000','#B22222','#FF7F50',
        '#9ACD32','#FF4500','#2E8B57','#DAA520','#D2691E',
        '#5F9EA0','#1E90FF','#FF69B4','#8A2BE2','#00FF7F'
    ]
var randomColorsChosen = {};

function resolveColor(chan, name, color) {
    if(color !== null) {
        return color;
    }
    if(!(chan in randomColorsChosen)) {
        randomColorsChosen[chan] = {};
    }
    if(name in randomColorsChosen[chan]) {
        color = randomColorsChosen[chan][name];
    }
    else {
        color = defaultColors[Math.floor(Math.random()*defaultColors.length)];
        randomColorsChosen[chan][name] = color;
    }
    return color;
}

client.on('chat', function(channel, user, message, self) {
    var color = resolveColor(channel, user['display-name'], user['color']);
    io.emit('twitch message', ["color:" + color, user['display-name'], ": " + message]);
});

client.on('connected', function(address, port) {
    io.emit('chat message', "My nipples look like milk duds");
  });

app.use(function (req, res, next) {
    res.status(404).send('404: Sorry cant find that!')
})

// This literally starts the server
http.listen(3000, function(){
  console.log('listening on *:3000');
});

