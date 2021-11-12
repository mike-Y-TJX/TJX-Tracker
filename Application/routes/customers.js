var express = require('express');
var router = express.Router();
var customersMockData = require("../mockdata/customers")


router
.route('/')
.get((req, res, next) => {
    res.json(customersMockData)
    
})

module.exports = router;
