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
    console.log('Received push notification on repository ' + req.repository._id);
    console.log('Cloning from ' + req.repository.url);

    clone(req.repository).then(function(repo) {
        return Promise.all(req.repository.remotes.map(function(remote) {
            var fullRemoteName = req.repository._id + '/' + remote.name;
            console.log('Adding remote ' + fullRemoteName);

            return Git.Remote.create(repo, remote.name, remote.url).then(function(createdRemote) {
                console.log('Pushing to ' + fullRemoteName + ' ...');

                //TODO: Branch support
                return createdRemote.push(
                    ['refs/heads/master:refs/heads/master'],
                    {
                        callbacks: {
                            certificateCheck: function() { return 1; },
                            credentials: function(a,b) {
                                return Git.Cred.userpassPlaintextNew('CODE_HERE', 'x-oauth-basic');
                            }
                        }
                }).then(function() {
                    console.log('...push to ' + fullRemoteName + ' done');
                }).catch(function (err) {
                    console.error(err);
                });
            });
        }));
    }).then(function() {
        console.log('Hook for repository ' + req.repository._id + ' done!');
    }).catch(function (err) {
        console.error(err);
    });

    return res.status(204).send('');
}

function getTmpRepoPath(repo) {
    return path.join(__dirname, 'tmpRepos/' + repo._id);
}

function clone(repo) {
    return Git.Clone(repo.url, getTmpRepoPath(repo), {
        fetchOpts: {
            callbacks: {
                certificateCheck: function() { return 1; }
            }
        }
    });
}

module.exports = router;
