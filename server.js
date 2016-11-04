var assert = require('assert');
var express = require('express');
var db = require('mongoennung');

var PORT = process.env.PORT || 8080;

db.connect('mongodb://localhost:27017/cpt-git', startServer);

function startServer(err) {
    assert.ifError(err);

    var app = express();
    app.use('/api', require('./controllers'));

    var server = app.listen(PORT, function(){
        var host = server.address().address;
        var port = server.address().port;

        console.log('Listening on' + host + ':' + port);
    });
}
