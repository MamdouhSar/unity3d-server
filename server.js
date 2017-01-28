/**
 * Created by appleuser3 on 1/10/17.
 */
var express = require('express');
var path = require('path');
var cors = require('cors');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var ParseServer = require('parse-server').ParseServer;
var Parse = require('parse/node');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

var app = express();
app.use(cors());

//-------------------------Configuring Parse Server
var api = new ParseServer({
    databaseURI: databaseUri || 'mongodb://localhost:27107/devUnity',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: process.env.APP_ID || 'MyAppId',
    masterKey: process.env.MASTER_KEY || 'masterKey',
    serverURL: process.env.SERVER_URL || 'https://localhost:1335/parse',
    javascriptKey: process.env.JAVASCRIPT_KEY || '',
    restAPIKey: process.env.REST_API_KEY || '',
    dotNetKey: process.env.DOT_NET_KEY || '',
    clientKey: process.env.CLIENT_KEY || '',
    facebookAppIds: [process.env.FACEBOOK_APP_ID],
    push: {
        android: {
            senderId: process.env.ANDROID_SENDER_ID || '',
            apiKey: process.env.ANDROID_API_KEY || ''
        }
    },
    verbose: true
});

app.use('/parse', api);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

var port = process.env.PORT || 1335;

var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('Unity3D Server is running');
});

//-------------------------Configuring Socket.io for real-time chat
var io = require('socket.io')(httpServer);

io.on('connection', function(socket){
    console.log('user connected');
    /*socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });*/

    socket.on('subscribe', function(conversation) {
        console.log('joining room ', conversation);
        socket.join(conversation);
    });

    socket.on('send message', function(data) {
        console.log('sending conversation post ', data.conversation);
        socket.broadcast.to(data.conversation).emit('conversation private post', {
            message: data.message
        });
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});
