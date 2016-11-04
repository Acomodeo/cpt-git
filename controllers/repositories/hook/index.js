var router = require('express').Router();
var assertError = require('assert').ifError;
var bodyParser = require('body-parser');
var Git = require('nodegit');
var path = require('path');
var Promise = require('promise');

router.use(bodyParser.json());

router.route('/')
    .post(handlePost);

function handlePost(req, res) {
    console.log('Received push notification on repository ' + req.repository.name);
    console.log('Cloning from ' + req.repository.url);

    clone(req.repository).then(funciton(repo) {
        return Promise.all(req.repository.remotes.map(function(remote) {
            var fullRemoteName = req.repository.name + '/' + remote.name;
            console.log('Adding remote ' + fullRemoteName);

            return Git.Remote.Create(repo, remote.name, remote.url).then(function(createdRemote) {
                console.log('Pushing to ' + fullRemoteName + ' ...');

                //TODO: Branch support
                return createdRemote.push('master').then(function() {
                    console.log('...push to ' + fullRemoteName + ' done');
                });
            });
        }));
    }).then(function() {
        console.log('Hook for repository ' + req.repository.name + ' done!');
    });

    return res.status(204).send('');
}

function getTmpRepoPath(repo) {
    return path.join(__dirname, 'tmpRepos');
}

function clone(repo) {
    return Git.Clone(repo.url, getTmpRepoPath(repo));
}

module.exports = router;
