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

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '',
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  javascriptKey: process.env.JAVASCRIPT_KEY || '',
  restAPIKey: process.env.REST_API_KEY || '',
  dotNetKey: process.env.DOT_NET_KEY || '',
  clientKey: process.env.CLIENT_KEY || ''
});

app.use('/parse', api);

app.get('/', function(req, res) {
    res.status(200).send('404 Page not found');
});

var port = process.env.PORT || 1335;

var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('Unity3D Server is running here');
});

