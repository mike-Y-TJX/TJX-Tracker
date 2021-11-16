var express = require('express');
var router = express.Router();
var productsMockData = require("../mockdata/products")


router.route('/').get((req, res, next) => {
    res.json(productsMockData)
})

module.exports = router;