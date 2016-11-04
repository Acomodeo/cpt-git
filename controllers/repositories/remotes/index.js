var router = require('express').Router();
var assertError = require('assert').ifError;

var bodyParser = require('body-parser');

var db = require('mongoennung');

var collection = db.collection('repositories');

router.use(bodyParser.json());

router.route('/')
    .post(handlePost)
    .get(handleGetAll);

router.param('name', idMiddleware);

router.route('/:name')
    .get(handleGetOne)
    .delete(handleDelete);

function handleGetAll(req, res) {
    res.status(200).json(req.repository.remotes);
}

function handleGetOne(req, res) {
    res.status(200).json(req.remote);
}

function handleDelete(req, res) {
    collection.updateOne(
        { _id: req.repository._id },
        { $pull: { remotes: { name: req.remote.name } } },
        onUpdated
    );

    function onUpdated(err) {
        assertError(err);

        return res.status(204).send('');
    }
}

function handlePost(req, res) {
    var remote = req.body;

    if(extractRemoteByName(req.repository.remotes, remote.name))
        return res.status(409).send('A Remote with that name already exists');

    collection.updateOne(
        { _id: req.repository._id },
        { $push: { remotes: remote } },
        onUpdated
    );

    function onUpdated(err, result) {
        assertError(err);

        res.set('Location', '/repositories/' + req.repository._id + '/remotes/' + remote.name);
        return res.status(201).json(remote);
    }
}

function idMiddleware(req, res, next, id) {
    var remote = extractRemoteByName(req.repository.remotes, id);

    if(!remote)
        res.status(404).send();

    req['remote'] = remote;

    next();
}

function extractRemoteByName(remotes, name) {
    return remotes.filter(function(remote) {
        return remote.name == name;
    })[0];
}

module.exports = router;
