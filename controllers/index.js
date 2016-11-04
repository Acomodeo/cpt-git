var router = require('express').Router();

router.use('/users', require('./users'));
router.use('/scripts', require('./scripts'));

module.exports = router;
