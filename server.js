/**
 * Created by appleuser3 on 1/10/17.
 */
var express = require('express');
var path = require('path');
var cors = require('cors');
var ParseServer = require('parse-server').ParseServer;

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

var app = express();
app.use(cors());

var httpServer = require('http').createServer(app);
var io = require('socket.io')(httpServer);

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/devUnity',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '',
  serverURL: process.env.SERVER_URL || 'http://localhost:1335/parse',
  javascriptKey: process.env.JAVASCRIPT_KEY || '',
  restAPIKey: process.env.REST_API_KEY || '',
  dotNetKey: process.env.DOT_NET_KEY || '',
  clientKey: process.env.CLIENT_KEY || ''
});

io.on('connection', function(socket){
  console.log('a user connected');
});

app.use('/parse', api);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

var port = process.env.PORT || 1335;

httpServer.listen(port, function() {
    console.log('Unity3D Server is running');
});

