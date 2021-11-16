'use strict';
var express = require('express');
var router = express.Router();
const db = require('../config/database/db');

router
	.route('/')
	.get(async (req, res, next) => {
		try {
			// SQL query
			const [rows, fields] = await db.query(
				`SELECT * FROM orders LIMIT 1000;`
			);

			// validate db returned results, return to user or throw error
			if (rows && rows.length > 0) {
				res.json(rows);
			} else {
				throw new Error('No orders found');
			}
		} catch (er) {
			res.status(400).send('No orders found');
		}
	})
	.post(async (req, res, next) => {
		// POST new order to database - consider as draft?
	});

router
	.route('/:id')
	.get(async (req, res, next) => {
		try {
			// SQL query
			const [rows, fields] = await db.query(
				`SELECT * FROM orders
                WHERE order_id = ?;`,
				[req.params.id]
			);

			// validate db returned results, return to user or throw error
			if (rows && rows.length > 0) {
				res.json(rows);
			} else {
				throw new Error('No order found');
			}
		} catch (er) {
			res.status(400).send('No order found');
		}
	})
	.put(async (req, res, next) => {
		// might make sense as patch?
		// look into the orders table and orderDetails table, find out what info
		// is needed, what tables we need to update, etc.
		// UPDATE order by order_id to modify the details...
	})
	.delete(async (req, res, next) => {
		try {
			/////////////////////////////////////////////////////////////
			// confirm order is in "Draft" status before beginning query
			/////////////////////////////////////////////////////////////

			await db.beginTransaction();

			const existingOrderDeleted = await db.query(
				`DELETE FROM orders
                WHERE order_id = ?;`,
				[req.params.id]
			);

			await db.commit();

			// validate db was updated
			if (existingOrderDeleted[0].affectedRows > 0) {
				res.send('Successfully deleted order');
			} else {
				throw new Error('Order not deleted');
			}
		} catch (er) {
			res.status(400).send('Order not deleted');
		}
	});

module.exports = router;
