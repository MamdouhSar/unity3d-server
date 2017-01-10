/**
 * Created by appleuser3 on 1/10/17.
 */
var express = require('express');
var app = express();
var ParseServer = require('parse-server').ParseServer;

var api = new ParseServer({

});

app.use('', api);

app.get('/', function(req, res) {
    res.status(200).send('Server is running here');
});

var port = process.env.PORT || 1335;

var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('Unity3D Server is running here');
});

