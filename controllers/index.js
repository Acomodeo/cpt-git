var router = require('express').Router();

router.use('/repositories', require('./repositories'));

module.exports = router;
