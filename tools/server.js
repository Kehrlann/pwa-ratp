var express = require('express');
var request = require('request');
var fs      = require('fs');
var server  = express();
var api     = null;

var lines   = null;

var apiExists = false;
try
{
    fs.statSync('api.json');
    api = JSON.parse(fs.readFileSync('api.json', 'utf8'));
    console.log("API key found, using base URI : " + api.baseUri);
}
catch (e)
{
    lines = JSON.parse(fs.readFileSync('line.json', 'utf8'));
    console.log("API key not found, generating fake data. To use an api key, see api.json.sample ...");
}

var randomBetween = function(min, max) { return Math.floor(min + Math.random() * max);}
var generateStopData =      function(directionId, minutes)
                            {
                                return          "<nextStop><directionId>"
                                            +   directionId
                                            +   "</directionId><waitingTime>"
                                            +   minutes * 60
                                            +   "</waitingTime><waitingTimeRaw>"
                                            +   minutes
                                            +   " mn</waitingTimeRaw></nextStop>";
                            };


server.use(express.static('../polymer/'));
server.get('/', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('../polymer/index.html', { root: __dirname });
});

if(api && api.baseUri && api.key)
{
    server.all('/api', function(req, res) {
        var url = api.baseUri + req.url.replace("/api", "") + "&keyapp=" + api.key;
        req .pipe   (   request (
                                    url,
                                    function(error, response, body)
                                    {
                                        if(error)
                                        {
                                            console.error("---->   Erreur de proxy HTTP");
                                            console.error(error);
                                        }
                                    }
                                )
                    )
            .pipe   (res);
        //res.send('Hello World!');
    });
}
else
{
    server.all('/api', function(req, res) {
        var match = req.url.match(/cmd=(\w+)/);
        var cmd = null;
        if(match && match.length > 1)
        {
            cmd = match[1];
        }

        match = req.url.match(/line=(\d+)/);
        var line = null;
        if(match && match.length > 1)
        {
            line = match[1];
        }

        if(cmd == "getNextStopsRealtime" && line)
        {
            var f = lines.filter(function(l) { return l.id == line});
            var line = lines[0];
            if(f && f.length > 0)
            {
                line = f[0];
            }

            var stops = line    .value
                                .direction  .map    (   function(dir)
                                                        {
                                                            var offset = 0;
                                                            var res = "";
                                                            for(var i = 0; i < 3 ; i++)
                                                            {
                                                                var time = randomBetween(offset, 3 + i);
                                                                res += generateStopData(dir.id, time);
                                                                offset = offset + time;
                                                            }
                                                            return res;
                                                        }
                                                    );

            var resp    =   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                        +   '<data>'
                        +   '<currentTime>'
                        +   (new Date()).toISOString()
                        +   '</currentTime>'
                        +   '<stops>'
                        +   stops.join("")
                        +   '</stops>'
                        +   '</data>' ;

            return res.status(200).set('Content-Type', 'text/xml').send(resp);
        }
        else
        {
            res.status(500).send('Commande invalide !');
        }
    });

}



server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
