/**
 * Created by appleuser3 on 1/10/17.
 */
var express = require('express');
var path = require('path');
var cors = require('cors');
var ParseServer = require('parse-server').ParseServer;
var Parse = require('parse/node');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

var app = express();
app.use(cors());

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_d7sm06pf:cak0b4unnjhnoouompb4gcm6tp@ds159348.mlab.com:59348/heroku_d7sm06pf',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'Unity3DServer',
  masterKey: process.env.MASTER_KEY || 'xJQ8tCI73N',
  serverURL: process.env.SERVER_URL || 'https://localhost:1335/parse',
  javascriptKey: process.env.JAVASCRIPT_KEY || '2lKrCoZVRA',
  restAPIKey: process.env.REST_API_KEY || 'uaiF2yCMnB',
  dotNetKey: process.env.DOT_NET_KEY || 'b6YhWaaebP',
  clientKey: process.env.CLIENT_KEY || '5pk333og1c'
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

var io = require('socket.io')(httpServer);

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('subscribe', function(room) {
    console.log('joining room ', room);
    socket.join(room);
  });

  socket.on('send message', function(data) {
      console.log('sending room post ', data.room);
      socket.broadcast.to(data.room).emit('conversation private post', {
          message: data.message
      });
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
