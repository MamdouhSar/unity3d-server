/**
 * Created by appleuser3 on 1/10/17.
 */
var express = require('express');
var path = require('path');
var ParseServer = require('parse-server').ParseServer;
var Parse = require('parse/node');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

var app = express();

//-------------------------Configuring Parse Server
var api = new ParseServer({
    databaseURI: databaseUri || 'mongodb://localhost:27017/devUnity',
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
        ios:
          {
            pfx: 'cert/FokalDevAPN.p12', // Dev PFX or P12
            bundleId: 'com.fokalinc.fokal',
            key:'Starbucks2017!',
            production: false // Dev
          }
    },
    verbose: true
});

app.use('/public', express.static('public'));
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

Parse.initialize("Unity3DServer", "2lKrCoZVRA", "xJQ8tCI73N");
Parse.serverURL = "https://unity3d-server.herokuapp.com/parse";

io.on('connection', function(socket){
    console.log('user connected');

    socket.on('subscribe', function(conversation) {
        console.log('joining room ', conversation);
        Parse.Cloud.run('messagesRead', {
          'conversationId': conversation.conversation,
          'userId': conversation.currentUserId
        }).then(function() {
          socket.join(conversation.conversation);
        }, function(error) {
          console.log(error);
        });
    });

    socket.on('send message', function(data) {
        console.log('sending conversation post ', data.conversation);
        console.log('message ', data.message);
        var messageObject = {
            'conversationId': data.conversation,
            'sentBy': data.sentBy,
            'sentTo': data.sentTo,
            'content': data.message
        };
        Parse.Cloud.run('saveMessage', messageObject).then(
          function(result) {
            console.log(JSON.stringify(result), data.conversation, data.message);
            socket.broadcast.to(data.conversation).emit('conversation private post', {
                message: data.message
            });
          },
          function(error) {
              console.log(error);
          }
        );
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});
