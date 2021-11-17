var express = require('express');
var router = express.Router();
const db = require('../config/database/db');

router.route('/')
.get(async (req, res, next) => {
	db.query(
		`SELECT * FROM Products LIMIT 1000;`,
		(error, results, fields) => {
			if (error || results.length == 0) {
				res.status(400).send('No products found');
			} else {
				res.json(results);
			}
		}
	)
})
.post(async (req, res, next) => {
	let validProduct = false;
	const newProduct = req.body;

	// validate new customer's data fields - number, name, types
	if (
		typeof newProduct.product_sku === 'string' &&
		typeof newProduct.product_price === 'number' &&
		typeof newProduct.product_name === 'string' &&
		typeof newProduct.product_quantity === 'number' &&
		typeof newProduct.product_description === 'string' &&
		typeof newProduct.image_url === 'string' 
	) {
		validProduct = true;
	}
		
	if (!validProduct) {
		return res.status(400).send('Product Not Added');
	}

	

	db.query(
		`INSERT INTO Products
		(product_sku,product_price,product_name,product_quantity,product_description,image_url)
		VALUES (?,?,?,?,?,?);`,
		[
			newProduct.product_sku,
			newProduct.product_price,
			newProduct.product_name,
			newProduct.product_quantity,
			newProduct.product_description,
			newProduct.image_url
		],
		(error, results, fields) => {
			if (error || results.length == 0) {
				res.status(400).send('Customer not added');
			} else {
				res.json({...newProduct, product_id: results.insertId});
			}
		}
	)
});

router
	.route('/:id')
	.get(async (req, res, next) => {
		db.query(
			`SELECT * FROM Products WHERE product_id = ?;`,
			[req.params.id],
			(error, results, fields) => {
				if (error || results.length == 0) {
					res.status(400).send('No Product Found');
				} else {
					res.json(results);
				}
			}
		)
	})
	.put(async (req, res, next) => {
		console.log("ran")
		// grab the put parameters
		let updatedProduct = req.body;
		let validUpdateTypes = false

		// validate TYPES of put parameters only if they have been requested to change
		if (
			(updatedProduct.product_sku === undefined || typeof updatedProduct.product_sku === 'string') &&
			(updatedProduct.product_price === undefined || typeof updatedProduct.product_price === 'number') &&
			(updatedProduct.product_name === undefined || typeof updatedProduct.product_name === 'string') &&
			(updatedProduct.product_quantity === undefined || typeof updatedProduct.product_quantity === 'number') &&
			(updatedProduct.product_description === undefined || typeof updatedProduct.product_description === 'string') &&
			(updatedProduct.image_url === undefined || typeof updatedProduct.image_url === 'string') 
		) {
			validUpdateTypes = true;
			console.log("valid types")
		}

		// if types are not valid send back error
		if(!validUpdateTypes){
			console.log("ran")
			return res.status(400).send('Invalid Parameters');
		}

		// query for customer in database by customer_id
		db.query(
			`SELECT product_sku, product_price, product_name, product_quantity,
			product_description, image_url
			FROM Products
			WHERE product_id = ?;`,
			[req.params.id],
			(error, results, fields) => {

				// mysql returns a wierd array, this converts it to a regular array of results
				var resultsArray = results.map((mysqlObj, index) => {
					return Object.assign({}, mysqlObj);
				});

				// if database didn't retrun exaclty 1 value, customer_id is not valid
				if(!(resultsArray.length == 1)){
					return res.status(400).send('Invalid Product');
				}

				databaseProduct = resultsArray[0]
				console.log(databaseProduct)
				// finalProduct fields are either a PUT parameter, an empty string or 0, or w.e we have in the database 
				var finalProduct = {
					product_sku:  updatedProduct.product_sku || (updatedProduct.product_sku === "" ? "" : databaseProduct.product_sku),
					product_price: updatedProduct.product_price || (updatedProduct.product_price === 0 ? 0 : databaseProduct.product_price),
					product_name: updatedProduct.product_name || (updatedProduct.product_name === "" ? "" : databaseProduct.product_name),
					product_quantity: updatedProduct.product_quantity || (updatedProduct.product_quantity === 0 ? 0 : databaseProduct.product_quantity),
					product_description: updatedProduct.product_description || (updatedProduct.product_description === 0 ? 0 : databaseProduct.product_description),
					image_url: updatedProduct.image_url || (updatedProduct.image_url === "" ? "" : databaseProduct.image_url),
				}

				// update in db
				db.query(
					`UPDATE Products SET
					product_sku = ?,
					product_price = ?,
					product_name = ?,
					product_quantity = ?,
					product_description = ?,
					image_url = ?
					WHERE product_id = ?;`,
					[
						finalProduct.product_sku,
						finalProduct.product_price,
						finalProduct.product_name,
						finalProduct.product_quantity,
						finalProduct.product_description,
						finalProduct.image_url,
						req.params.id
					],
					(error, result, fields) => {
						if(error){
							res.status(500).send("database error")
						}
						res.json(finalProduct)
					}
				)	
			})
	})
	.delete(async (req, res, next) => {
		db.query(
			`DELETE FROM Products
			WHERE product_id = ?;`,
			[req.params.id],
			(error, results, fields) => {
				var results = Object.assign({}, results);
				if(results.affectedRows == 0 || error){
					return res.status(400).send('Product not deleted')
				} else {
					res.send('Successfully Deleted Product');
				}
			}
		)
	});

module.exports = router;
