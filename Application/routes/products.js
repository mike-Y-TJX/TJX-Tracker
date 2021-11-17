var express = require('express');
var router = express.Router();
const db = require('../config/database/db');

router.route('/').get(async (req, res, next) => {
	try {
		//SQL query
		const [rows, fields] = await db.query(
			`SELECT * FROM Products LIMIT 1000;`
		);

		// validate db returned resutls, return to user or throw error
		if (rows && rows.length > 0) {
			res.json(rows);
		} else {
			throw new Error('No products found');
		}
	} catch (er) {
		res.status(400).send('No products found');
	}
});

router
	.route('/:id')
	.get(async (req, res, next) => {
		try {
			// SQL query
			const [rows, fields] = await db.query(
				`SELECT * FROM products
                WHERE product_id = ?;`,
				[req.params.id]
			);

			// validate db returned results, return to user or throw error
			if (rows && rows.length > 0) {
				res.json(rows);
			} else {
				throw new Error('No product found');
			}
		} catch (er) {
			res.status(400).send('No product found');
		}
	})
	.put(async (req, res, next) => {
		const updatedProduct = req.body;

		try {
			await db.beginTransaction();
			const existingProductUpdated = await db.query(
				`UPDATE Products SET
                product_sku = ?,
                product_price = ?,
                product_name = ?,
                product_quantity = ?,
                product_description = ?,
                image_url = ?
                WHERE product_id = ?;`,
				[
					updatedProduct.product_sku,
					updatedProduct.product_price,
					updatedProduct.product_name,
					updatedProduct.product_quantity,
					updatedProduct.product_description,
					updatedProduct.image_url,
					req.params.id,
				]
			);
			await db.commit();

			// validate database was updated
			if (existingProductUpdated[0].affectedRows > 0) {
				res.json(updatedProduct);
			} else {
				throw new Error('Product not updated');
			}
		} catch (er) {
			res.status(400).send('Product not updated');
		}
	});

module.exports = router;
