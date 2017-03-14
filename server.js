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
    appName: 'FOKAL',
    publicServerURL: 'https://unity3d-server.herokuapp.com/',
    masterKey: process.env.MASTER_KEY || 'masterKey',
    serverURL: process.env.SERVER_URL || 'https://localhost:1335/parse',
    javascriptKey: process.env.JAVASCRIPT_KEY || '',
    restAPIKey: process.env.REST_API_KEY || '',
    dotNetKey: process.env.DOT_NET_KEY || '',
    clientKey: process.env.CLIENT_KEY || '',
    auth: { facebook: { appIds: [process.env.FACEBOOK_APP_ID] } },
    push: {
        ios:
          {
            pfx: __dirname  + process.env.CERT_PATH, // Dev PFX or P12
            bundleId: process.env.BUNDLE_ID,
            passphrase: process.env.CERT_PASSPHRASE,
            production: true
          }
    },
    emailAdapter: {
      module: "parse-server-genericemail-adapter",
      options: {
        service: "Gmail", // Could be anything like yahoo, hotmail, etc, Full list - https://github.com/nodemailer/nodemailer-wellknown
        email: "mamdouh.alsarayreh@gmail.com",
        password: "94692a1B2"  //Hmm right now no other way
      }
     },
    verbose: false
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

Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY, process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL ;

io.on('connection', function(socket){
    console.log('user connected');

    socket.on('subscribe', function(conversation) {
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
        var messageObject = {
            'conversationId': data.conversation,
            'sentBy': data.sentBy,
            'sentTo': data.sentTo,
            'content': data.message,
            'isObject': data.isObject
        };
        Parse.Cloud.run('saveMessage', messageObject).then(
          function(result) {
            var sendData = {
              'message': data.message,
              'isObject': data.isObject
            };
            socket.broadcast.to(data.conversation).emit('conversation private post', sendData);
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
