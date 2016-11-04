var router = require('express').Router();
var assertError = require('assert').ifError;
var bodyParser = require('body-parser');
var db = require('mongoennung');

var collection = db.collection('repositories');

router.use(bodyParser.json());

router.route('/')
    .post(handlePost)
    .get(handleGetAll);

router.param('id', idMiddleware);

router.route('/:id')
    .get(handleGetOne)
    .patch(handlePatch)
    .put(handlePut)
    .delete(handleDelete);

router.use('/:id/remotes', require('./remotes'));

function handlePut(req, res) {
    collection.replaceOne({ _id: req.repository._id }, transformToInner(req.repository), onReplaced);

    function onReplaced(err, result) {
        assertError(err);

        return res.status(204).send('');
    }
}

function handleGetAll(req, res) {
    collection.find({}).map(transformToOuter).toArray(onFind);

    function onFind(err, result) {
        assertError(err);

        res.status(200).json(result);
    }
}

function handleGetOne(req, res) {
    res.status(200).json(transformToOuter(req.repository));
};

function handlePost(req, res) {
    var repository = req.body;

    collection.findOne({ _id: repository.name }, { _id: 1 }, onFind);

    function onFind(err, result) {
        assertError(err);

        if(!!result)
            return res.status(409).send('A repository with that name already exists');

        repository = transformToInner(repository);

        collection.insertOne(repository, onInserted);
    }

    function onInserted(err, result) {
        res.set('Location', '/repositories/' + repository._id);
        return res.status(201).json(result.ops[0]);
    }

}

function handlePatch(req, res) {
    collection.updateOne(
        { _id: req['repository']._id },
        { $set: req.body },
        onUpdated
    );

    function onUpdated(err) {
        assertError(err);

        res.status(204).send();
    }
}

function handleDelete(req, res) {
    collection.remove({ _id: req.repository._id }, onRemoved);

    function onRemoved(err) {
        assertError(err);

        return res.status(204).send('');
    }
}

function idMiddleware(req, res, next, id) {
    collection.findOne({ _id: id }, onFind);

    function onFind(err, result) {
        assertError(err);

        if(!result)
            res.status(404).send();

        req['repository'] = result;

        next();
    }
}

function transformToInner(repository) {
    repository._id = repository.name;
    delete repository.name;

    return repository;
}

function transformToOuter(repository) {
    repository.name = repository._id;
    delete repository._id;

    return repository;
}

module.exports = router;
