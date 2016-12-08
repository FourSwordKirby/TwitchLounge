# TwitchLounge
Visualization of the Twitch Experience in an actual room

# Setup
I'm still exploring which version of Node to use. So far these seem to be ok:

Node: v5.0.0
(You can use NVM if you want or just install that version)

After installing, install NPM (Node package manager).

Then, to install the modules, run the following:
npm install

Next, install mongo DB. This is a simple database that lets us save stuff.
http://treehouse.github.io/installation-guides/mac/mongo-mac.html

I would also recommend the following b/c they make development easier:
* npm install -g node-inspector (then you can run node-debug server.js and use a browser for debugging. Use 'debugger')
* npm install -g nodemon (small changes on server code will automatically restart server)

Finally, ask me for the keys.json file.
It should run.

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

# Production
https://devcenter.heroku.com/articles/getting-started-with-nodejs#prepare-the-app

Deployed to Heroku. Initial setup:
1. heroku login
2. heroku create
3. heroku addons:add mongolab
4. heroku ps:scale web=1
5. heroku open

Heroku Mongo DB: heroku config | grep MONGODB_URI
Heroku port: process.env.PORT

Here are a few commands I found myself using often to redeploy:
* git push heroku master
* heroku logs --tail


