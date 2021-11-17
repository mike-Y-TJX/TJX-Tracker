var express = require('express');
var router = express.Router();
const db = require('../config/database/db');

router
	.route('/')
	.get(async (req, res, next) => {
		try {
			// SQL query
			const [rows, fields] = await db.query(
				`SELECT * FROM Customers LIMIT 2000;`
			);

			// validate db returned results, return to user or throw error
			if (rows && rows.length > 0) {
				res.json(rows);
			} else {
				throw new Error('No customers found');
			}
		} catch (er) {
			res.status(400).send('No customers found');
		}
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

		if (validCustomer) {
			try {
				// begin database transaction
				await db.beginTransaction();

				// INSERT the new customer into database
				const newCustomerAdded = await db.query(
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
					]
				);

				// commit the transaction
				await db.commit();

				// send new customer info to user
				res.send(newCustomer);
			} catch (er) {
				res.status(400).send('Customer not added');
			}
		} else {
			// customer input was not valid
			res.status(400).send('Not a valid customer');
		}
	});

router
	.route('/:id')
	.get(async (req, res, next) => {
		try {
			// SQL query
			const [rows, fields] = await db.query(
				`SELECT * FROM Customers
                WHERE customer_id = ?;`,
				[req.params.id]
			);

			// validate db returned results, return to user or throw error
			if (rows && rows.length > 0) {
				res.json(rows);
			} else {
				throw new Error('No customer found');
			}
		} catch (er) {
			res.status(400).send('No customer found');
		}
	})
	.put(async (req, res, next) => {
		const updatedCustomer = req.body;
		let [rows, fields] = await db.query(
			`SELECT first_name, middle_name, last_name, phone_country_code,
			phone, email, customer_notes, street, city, zip_code, country
			FROM Customers
			WHERE customer_id = ?;`,
			[req.params.id]
		);

		let originalCustomer = {
			first_name: rows[0].first_name,
			middle_name: rows[0].middle_name,
			last_name: rows[0].last_name,
			phone_country_code: rows[0].phone_country_code,
			phone: rows[0].phone,
			email: rows[0].email,
			customer_notes: rows[0].customer_notes,
			street: rows[0].street,
			city: rows[0].city,
			zip_code: rows[0].zip_code,
			country: rows[0].country,
		};

		const finalCustomer = Object.assign(originalCustomer, updatedCustomer);

		try {
			await db.beginTransaction();

			const existingCustomerUpdated = await db.query(
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
					req.params.id,
				]
			);

			await db.commit();

			// validate database was updated
			if (existingCustomerUpdated[0].affectedRows > 0) {
				res.json(finalCustomer);
			} else {
				throw new Error('Customer not updated');
			}
		} catch (er) {
			res.status(400).send('Customer not updated');
		}
	})
	.delete(async (req, res, next) => {
		try {
			await db.beginTransaction();

			const existingCustomerDeleted = await db.query(
				`DELETE FROM Customers
                WHERE customer_id = ?;`,
				[req.params.id]
			);

			await db.commit();

			// validate db was updated
			if (existingCustomerDeleted[0].affectedRows > 0) {
				res.send('Successfully deleted customer');
			} else {
				throw new Error('Customer not deleted');
			}
		} catch (er) {
			res.status(400).send('Customer not deleted');
		}
	});

module.exports = router;
