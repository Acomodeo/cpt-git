var router = require('express').Router();
var assertError = require('assert').ifError;
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.route('/')
    .post(handlePost);

function handlePost(req, res) {
    console.log('Received push notification on repository ' + req.repository.name);

    req.repository.remotes.forEach(function (remote) {
        console.log('Pushing to ' + remote.name);
    });

    return res.status(204).send('');
}

module.exports = router;
