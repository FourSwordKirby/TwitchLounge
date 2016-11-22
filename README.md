# TwitchLounge
Visualization of the Twitch Experience in an actual room

# Setup
I'm still exploring which version of Node to use. So far these seem to be ok:

Node: v5.0.0
(You can use NVM if you want or just install that version)

After installing, install NPM (Node package manager).

Then, to install the modules, run the following:
npm install

I would also recommend the following b/c they make development easier:
* npm install -g node-inspector (then you can run node-debug server.js and use a browser for debugging. Use 'debugger')
* npm install -g nodemon (small changes on server code will automatically restart server)

<<<<<<< HEAD
Finally, ask me for the keys.json file.
It should run.






# How to Run
In your command line, run

	node app/server.js

Then in your browser, type 
	http://localhost:3000/

This will bring your to the main "page" of the site. 
You can test multiple people using the site through an incognito window
=======
Next, install mongo DB. This is a simple database that lets us save stuff.
http://treehouse.github.io/installation-guides/mac/mongo-mac.html

Finally, ask me for the keys.json file. Put it in the root.

# To Run

First run the database server
mongod

Then run our server
node app/server.js

FYI: To close a process... First you must find it.
lsof -i:5858
kill -9 [PID]

For help debugging socket:
Clientside- localStorage.debug = '*';
Serverside- DEBUG=* node yourfile.js

http://justintv.github.io/twitch-js-sdk/#section-3-2
>>>>>>> mongo
