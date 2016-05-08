var express = require('express');
var request = require('request');
var fs      = require('fs');
var server  = express();

var api = JSON.parse(fs.readFileSync('api.json', 'utf8'));


server.use(express.static('../polymer/'));
server.get('/', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('../polymer/index.html', { root: __dirname });
});
server.all('/api', function(req, res) {
    var url = api.baseUri + req.url.replace("/api", "") + "&keyapp=" + api.key;
    req.pipe(request(url)).pipe(res);
    //res.send('Hello World!');
});
server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
