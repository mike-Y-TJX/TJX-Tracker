var express = require('express');
var router = express.Router();
const db = require('../config/database/db');

router
	.route('/')
	.get(async (req, res, next) => {
		db.query(
			`SELECT * FROM Customers LIMIT 2000;`,
			(error, results, fields) => {
				if (error || results.length == 0) {
					res.status(400).send('No customers found');
				} else {
					res.json(results);
				}
			}
		)
		
	})
	.post(async (req, res, next) => {
		let validCustomer = false;
		const newCustomer = req.body;

		// validate new customer's data fields - number, name, types
		if (
			typeof newCustomer.first_name === 'string' &&
			typeof newCustomer.middle_name === 'string' &&
			typeof newCustomer.last_name === 'string' &&
			typeof newCustomer.phone_country_code === 'number' &&
			typeof newCustomer.phone === 'number' &&
			typeof newCustomer.email === 'string' &&
			typeof newCustomer.customer_notes === 'string' &&
			typeof newCustomer.street === 'string' &&
			typeof newCustomer.city === 'string' &&
			typeof newCustomer.zip_code === 'string' &&
			typeof newCustomer.country === 'string'
		) {
			validCustomer = true;
		}
			
		if (!validCustomer) {
			return res.status(400).send('Customer Not Added');
		}

		db.query(
			`INSERT INTO Customers
			(first_name, middle_name, last_name, phone_country_code, phone, email, customer_notes, street, city, zip_code, country)
			VALUES (?,?,?,?,?,?,?,?,?,?,?);`,
			[
				newCustomer.first_name,
				newCustomer.middle_name,
				newCustomer.last_name,
				newCustomer.phone_country_code,
				newCustomer.phone,
				newCustomer.email,
				newCustomer.customer_notes,
				newCustomer.street,
				newCustomer.city,
				newCustomer.zip_code,
				newCustomer.country,
			],
			(error, results, fields) => {
				if (error || results.length == 0) {
					res.status(400).send('Customer not added');
				} else {
					res.json({...newCustomer, customer_id: results.insertId});
				}
			}
		)
			
	});

router
	.route('/:id')
	.get(async (req, res, next) => {

		db.query(
			`SELECT * FROM Customers WHERE customer_id = ?;`,
			[req.params.id],
			(error, results, fields) => {
				if (error || results.length == 0) {
					res.status(400).send('No customer found');
				} else {
					res.json(results);
				}
			}
		)
		
	})
	.put(async (req, res, next) => {

		// grab the put parameters
		let updatedCustomer = req.body;
		let validUpdateTypes = false

		// validate TYPES of put parameters only if they have been requested to change
		if (
			(updatedCustomer.first_name === undefined || typeof updatedCustomer.first_name === 'string') &&
			(updatedCustomer.middle_name === undefined || typeof updatedCustomer.middle_name === 'string') &&
			(updatedCustomer.last_name === undefined || typeof updatedCustomer.last_name === 'string') &&
			(updatedCustomer.phone_country_code === undefined || typeof updatedCustomer.phone_country_code === 'number') &&
			(updatedCustomer.phone === undefined || typeof updatedCustomer.phone === 'number') &&
			(updatedCustomer.email === undefined || typeof updatedCustomer.email === 'string') &&
			(updatedCustomer.customer_notes === undefined || typeof updatedCustomer.customer_notes === 'string') &&
			(updatedCustomer.street === undefined || typeof updatedCustomer.street === 'string') &&
			(updatedCustomer.city === undefined || typeof updatedCustomer.city === 'string') &&
			(updatedCustomer.zip_code === undefined || typeof updatedCustomer.zip_code === 'string') &&
			(updatedCustomer.country === undefined || typeof updatedCustomer.country === 'string')
		) {
			validUpdateTypes = true;
		}

		// if types are not valid send back error
		if(!validUpdateTypes){
			return res.status(400).send('Invalid Parameters');
		}

		// query for customer in database by customer_id
		db.query(
			`SELECT first_name, middle_name, last_name, phone_country_code,
			phone, email, customer_notes, street, city, zip_code, country
			FROM Customers
			WHERE customer_id = ?;`,
			[req.params.id],
			(error, results, fields) => {

				// mysql returns a wierd array, this converts it to a regular array of results
				var resultsArray = results.map((mysqlObj, index) => {
					return Object.assign({}, mysqlObj);
				});

				// if database didn't retrun exaclty 1 value, customer_id is not valid
				if(!(resultsArray.length == 1)){
					return res.status(400).send('Invalid Customer');
				}

				databaseCustomer = resultsArray[0]

				// finalCustomer fields are either a PUT parameter, an empty string or 0, or w.e we have in the database 
				var finalCustomer = {
					first_name:  updatedCustomer.first_name || (updatedCustomer.first_name === "" ? "" : databaseCustomer.first_name),
					middle_name: updatedCustomer.middle_name || (updatedCustomer.middle_name === "" ? "" : databaseCustomer.middle_name),
					last_name: updatedCustomer.last_name || (updatedCustomer.last_name === "" ? "" : databaseCustomer.last_name),
					phone_country_code: updatedCustomer.phone_country_code || (updatedCustomer.phone_country_code === 0 ? 0 : databaseCustomer.phone_country_code),
					phone: updatedCustomer.phone || (updatedCustomer.phone === 0 ? 0 : databaseCustomer.phone),
					email: updatedCustomer.email || (updatedCustomer.email === "" ? "" : databaseCustomer.email),
					customer_notes: updatedCustomer.customer_notes || (updatedCustomer.customer_notes === "" ? "" : databaseCustomer.customer_notes),
					street: updatedCustomer.street || (updatedCustomer.street === "" ? "" : databaseCustomer.street),
					city: updatedCustomer.city || (updatedCustomer.city === "" ? "" : databaseCustomer.city),
					zip_code: updatedCustomer.zip_code || (updatedCustomer.zip_code === "" ? "" : databaseCustomer.zip_code),
					country: updatedCustomer.country || (updatedCustomer.country === "" ? "" : databaseCustomer.country),
				}

				// update in db
				db.query(
					`UPDATE Customers SET
					first_name = ?,
					middle_name = ?,
					last_name = ?,
					phone_country_code = ?,
					phone = ?,
					email = ?,
					customer_notes = ?,
					street = ?,
					city = ?,
					zip_code = ?,
					country = ?
					WHERE customer_id = ?;`,
					[
						finalCustomer.first_name,
						finalCustomer.middle_name,
						finalCustomer.last_name,
						finalCustomer.phone_country_code,
						finalCustomer.phone,
						finalCustomer.email,
						finalCustomer.customer_notes,
						finalCustomer.street,
						finalCustomer.city,
						finalCustomer.zip_code,
						finalCustomer.country,
						req.params.id
					],
					(error, result, fields) => {
						if(error){
							res.status(500).send("database error")
						}
						res.json(finalCustomer)
					}
				)
				
			})


		// let [rows, fields] = await db.query(
		// 	`SELECT first_name, middle_name, last_name, phone_country_code,
		// 	phone, email, customer_notes, street, city, zip_code, country
		// 	FROM Customers
		// 	WHERE customer_id = ?;`,
		// 	[req.params.id]
		// );



		// let originalCustomer = {
		// 	first_name: rows[0].first_name,
		// 	middle_name: rows[0].middle_name,
		// 	last_name: rows[0].last_name,
		// 	phone_country_code: rows[0].phone_country_code,
		// 	phone: rows[0].phone,
		// 	email: rows[0].email,
		// 	customer_notes: rows[0].customer_notes,
		// 	street: rows[0].street,
		// 	city: rows[0].city,
		// 	zip_code: rows[0].zip_code,
		// 	country: rows[0].country,
		// };

		// let originalCustomer = {
		// 	first_name: await db.query(
		// 		`SELECT first_name FROM Customers WHERE customer_id = ?;`,
		// 		[req.params.id]
		// 	),
		// 	middle_name: rows[0].middle_name,
		// 	last_name: await db.query(
		// 		`SELECT last_name FROM Customers WHERE customer_id = ?;`,
		// 		[req.params.id]
		// 	),
		// 	phone_country_code: await db.query(
		// 		`SELECT phone_country_code FROM Customers WHERE customer_id = ?;`,
		// 		[req.params.id]
		// 	),
		// 	phone: await db.query(
		// 		`SELECT phone FROM Customers WHERE customer_id = ?;`,
		// 		[req.params.id]
		// 	),
		// 	email: await db.query(
		// 		`SELECT email FROM Customers WHERE customer_id = ?;`,
		// 		[req.params.id]
		// 	),
		// 	customer_notes: await db.query(
		// 		`SELECT customer_notes FROM Customers WHERE customer_id = ?;`,
		// 		[req.params.id]
		// 	),
		// 	street: await db.query(
		// 		`SELECT street FROM Customers WHERE customer_id = ?;`,
		// 		[req.params.id]
		// 	),
		// 	city: await db.query(
		// 		`SELECT city FROM Customers WHERE customer_id = ?;`,
		// 		[req.params.id]
		// 	),
		// 	zip_code: await db.query(
		// 		`SELECT zip_code FROM Customers WHERE customer_id = ?;`,
		// 		[req.params.id]
		// 	),
		// 	country: await db.query(
		// 		`SELECT country FROM Customers WHERE customer_id = ?;`,
		// 		[req.params.id]
		// 	),
		//};

		// console.log('original before assign:');
		// console.log(originalCustomer);
		// const finalCustomer = Object.assign(originalCustomer, updatedCustomer);
		// console.log('final after assign:');
		// console.log(finalCustomer);

		// try {
		// 	await db.beginTransaction();

		// 	const existingCustomerUpdated = await db.query(
		// 		`UPDATE Customers SET
        //         first_name = ?,
        //         middle_name = ?,
        //         last_name = ?,
        //         phone_country_code = ?,
        //         phone = ?,
        //         email = ?,
        //         customer_notes = ?,
        //         street = ?,
        //         city = ?,
        //         zip_code = ?,
        //         country = ?
        //         WHERE customer_id = ?;`,
		// 		[
		// 			finalCustomer.first_name,
		// 			finalCustomer.middle_name,
		// 			finalCustomer.last_name,
		// 			finalCustomer.phone_country_code,
		// 			finalCustomer.phone,
		// 			finalCustomer.email,
		// 			finalCustomer.customer_notes,
		// 			finalCustomer.street,
		// 			finalCustomer.city,
		// 			finalCustomer.zip_code,
		// 			finalCustomer.country,
		// 			req.params.id,
		// 		]
		// 	);

		// 	await db.commit();

		// 	// validate database was updated
		// 	if (existingCustomerUpdated[0].affectedRows > 0) {
		// 		res.json(finalCustomer);
		// 	} else {
		// 		throw new Error('Customer not updated');
		// 	}
		// } catch (er) {
		// 	res.status(400).send('Customer not updated');
		// }
	})
	.delete(async (req, res, next) => {
		db.query(
			`DELETE FROM Customers
			WHERE customer_id = ?;`,
			[req.params.id],
			(error, results, fields) => {
				var results = Object.assign({}, results);
				if(results.affectedRows == 0 || error){
					return res.status(400).send('Customer not deleted')
				} else {
					res.send('Successfully deleted customer');
				}
			}
		)
	});

module.exports = router;
