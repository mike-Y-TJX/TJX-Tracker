var express = require('express');
var router = express.Router();
var customersMockData = require('../mockdata/customers');
const db = require("../config/database/db")

// Mock data implementation:
/*
router
.route('/')

.get((req, res, next) => {
    res.json(customersMockData)
})
*/

// function implementation":
/*
modle.exports = function (db) {
    router.route()....
}
*/

router
	.route('/')
	.get(async (req, res, next) => {
		try {
			// SQL query
			const [rows, fields] = await db.query(`SELECT * FROM customer;`);

			// validate db returned results, return to user or throw error
			if (rows && rows.length > 0) {
				res.json(rows);
			} else {
				throw new Error('No customers found');
			}
		} catch (er) {
			res.status(400).send(er);
		}
	})
	.post(async (req, res, next) => {
		let validCustomer = false;
		const newCustomer = req.body;

		// validate new customer's data fields - number, name, types
		if (
			newCustomer.first_name &&
			typeof newCustomer.first_name === 'string' &&
			newCustomer.middle_name &&
			typeof newCustomer.middle_name === 'string' &&
			newCustomer.last_name &&
			typeof newCustomer.last_name === 'string' &&
			newCustomer.phone_country_code &&
			typeof newCustomer.phone_country_code === 'number' &&
			newCustomer.phone &&
			typeof newCustomer.phone === 'number' &&
			newCustomer.email &&
			typeof newCustomer.email === 'string' &&
			newCustomer.customer_notes &&
			typeof newCustomer.customer_notes === 'string' &&
			newCustomer.street &&
			typeof newCustomer.street === 'string' &&
			newCustomer.city &&
			typeof newCustomer.city === 'string' &&
			newCustomer.zip_code &&
			typeof newCustomer.zip_code === 'string' &&
			newCustomer.country &&
			typeof newCustomer.country === 'string'
		) {
			validCustomer = true;
		}

		if (validCustomer) {
			try {
				// begin database transaction
				await db.beginTransaction();

				// INSERT the new customer into database
				// **NOTE** have to remove customer_id fields once auto-incrementing in DB
				const newCustomerAdded = await db.query(
					`INSERT INTO customer
                    (customer_id, first_name, middle_name, last_name, phone_country_code, phone, email, customer_notes, street, city, zip_code, country)
					VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`,
					[
						newCustomer.customer_id,
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
				res.status(400).send(er);
			}
		} else {
			// customer input was not valid
			res.status(404).send();
		}
	});

router
	.route('/:id')
	.get(async (req, res, next) => {
		try {
			// SQL query
			const [rows, fields] = await db.query(
				`SELECT * FROM customer
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
			res.status(400).send('Customer not found');
		}
	})
	.put(async (req, res, next) => {
		const updatedCustomer = req.body;

		try {
			await db.beginTransaction();

			const existingCustomerUpdated = await db.query(
				`UPDATE customer SET
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
					updatedCustomer.first_name,
					updatedCustomer.middle_name,
					updatedCustomer.last_name,
					updatedCustomer.phone_country_code,
					updatedCustomer.phone,
					updatedCustomer.email,
					updatedCustomer.customer_notes,
					updatedCustomer.street,
					updatedCustomer.city,
					updatedCustomer.zip_code,
					updatedCustomer.country,
					req.params.id,
				]
			);

			await db.commit();

			// validate database was updated
			if (existingCustomerUpdated[0].affectedRows > 0) {
				res.json(updatedCustomer);
			} else {
				throw new Error('Customer not updated');
			}
		} catch (er) {
			res.status(400).send(er);
		}
	})
	.delete(async (req, res, next) => {
		try {
			await db.beginTransaction();

			const existingCustomerDeleted = await db.query(
				`DELETE FROM customer
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
