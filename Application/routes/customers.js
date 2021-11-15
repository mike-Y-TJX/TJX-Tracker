var express = require('express');
var router = express.Router();
var customersMockData = require('../mockdata/customers');

router.route('/').get((req, res, next) => {
	res.json(customersMockData);
});

router.route('/:id').get((req, res, next) => {
	res.send(`hello number ${req.params.id}`);
});

module.exports = router;
