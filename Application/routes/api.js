const express = require('express');
const router = express.Router();
//const productsRouter = require("./products");
const customersRouter = require('./customers');
//const ordersRouter = require("./orders");

module.exports = function () {
	console.log('api ran');
	//router.use("/products", productsRouter());
	router.use('/customers', customersRouter());
	//router.use("/orders", ordersRouter());
	return router;
};
