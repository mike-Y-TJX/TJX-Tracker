'use strict';
var express = require('express');
var router = express.Router();
const db = require('../config/database/db');

router
	.route('/')
	.get(async (req, res, next) => {
		db.query(
			`SELECT 
			o.order_id, o.order_notes, o.datetime_order_placed,
			od.quantity_purchased, 
			os.status_desc, 
			p.product_id, p.product_sku, p.product_price, p.product_name, p.product_quantity, p.product_description, p.image_url, 
			c.first_name, c.middle_name, c.last_name, c.phone_country_code, c.phone,email, c.customer_notes, c.street, c.city, c.zip_code, c.country
			FROM orders o
			INNER JOIN 
			order_detail od
			ON
			o.order_id = od.order_id
			INNER JOIN 
			order_status os
			ON
			o.order_status = os.status_id
			INNER JOIN 
			customers c 
			ON
			c.customer_id = o.customer_id
			INNER JOIN 
			products p
			ON
			p.product_id = od.product_id
			;`,
			(error, results, fields) => {
				if(error || results.length == 0){
					return res.status(400).send("No Orders")
				}
				let orderData = []
				let processedOrders = {}

				results.forEach(order => {
					if (!processedOrders[order.order_id]){
						processedOrders[order.order_id] = [order.detail_id];
						orderData.push({
							order_id: order.order_id,
							order_notes: order.order_notes,
							datetime_order_placed: order.datetime_order_placed,
							status_desc: order.status_desc,
							customer_detail: {
								first_name: order.first_name,
								middle_name: order.middle_name,
								last_name: order.last_name,
								phone_country_code: order.phone_country_code,
								phone: order.phone,
								email: order.email,
								customer_notes: order.customer_notes,
								street: order.street,
								city: order.city,
								zip_code: order.zip_code,
								country: order.country,
							},
							order_detail:[
								{
									quantity_purchased: order.quantity_purchased,
									product_id: order.product_id, 
									product_sku: order.product_sku, 
									product_price: order.product_price, 
									product_name: order.product_name, 
									product_quantity: order.product_quantity, 
									product_description: order.product_description, 
									image_url: order.image_url,
								}
							]

						})
					} else {
						let orderIndex = orderData.findIndex((orders) => {
							return orders.order_id === order.order_id
						})
						orderData[orderIndex].order_detail.push(
							{
								quantity_purchased: order.quantity_purchased,
								product_id: order.product_id, 
								product_sku: order.product_sku, 
								product_price: order.product_price, 
								product_name: order.product_name, 
								product_quantity: order.product_quantity, 
								product_description: order.product_description, 
								image_url: order.image_url,
							}
						)
					}
				});

				res.json(orderData)	
			}
		)
	})
	.post(async (req, res, next) => {
		// customer_id, order_status, datetime_order_placed, total_order_price, order_notes
		// {
		// 	"order_notes": "Quos molestiae impedit ab delectus quaerat.",
		// 	"status_desc": "1", (default)
		//   "customer_id"
		// 	"order_detail": [
		// 		{
		// 			"quantity_purchased": 1,
		// 			"product_id": 3,
		// 		},
		// 		{
		// 			"quantity_purchased": 1,
		// 			"product_id": 10,
		// 		}
		// 	]
		// }

		let validOrderFields = false;
		let validOrderProductFields = true;
		const newOrder = req.body;
	
		// validate new customer's data fields - number, name, types
		if (
			typeof newOrder.order_notes === 'string' &&
			typeof newOrder.customer_id === 'number' 
		) {
			validOrderFields = true;
		}

		newOrder.order_detail.forEach((detail) => {
			validOrderProductFields = validOrderProductFields &&
			typeof detail.quantity_purchased === "number" &&
			typeof detail.product_id === "number" 
		})
		
		if (!validOrderFields || !validOrderProductFields || newOrder.order_detail.length === 0) {
			return res.status(400).send('Order Not Added');
		}

		db.query(
			`SELECT * FROM Customers WHERE customer_id = ?;`,
			[newOrder.customer_id],
			(error, results, fields) => {
				if (error || results.length == 0) {
					res.status(400).send('Not A Valid Customer ID');
				} 
			}
		)

		let questionMarkString = ""
		let arrayOfPproductIds = []
		let arrayOfPproductIdsWithQuantityAdded = []
		newOrder.order_detail.forEach((product, i) => {
			if (i + 1 < newOrder.order_detail.length){
				questionMarkString += "?,"
			} else {
				questionMarkString += "?"
			}	
			arrayOfPproductIds.push(product.product_id)
			arrayOfPproductIdsWithQuantityAdded.push()
		})

		db.query(
			`SELECT * FROM Products WHERE customer_id IN (${questionMarkString});`,
			arrayOfPproductIds,
			(error, results, fields) => {
				if (error || results.length != arrayOfPproductIds) {
					res.status(400).send('Not Valid Product Ids');
				} 
			}
		)

		// db.query(
		// 	`INSERT INTO Orders
		// 	(customer_id, order_status, order_notes,)
		// 	VALUES (?,?,?);`,
		// 	[
		// 		newOrder.customer_id,
		// 		"1",
		// 		newOrder.order_notes
		// 	],
		// 	(error, results, fields) => {
		// 		if (error || results.length == 0) {
		// 			res.status(400).send('Customer not added');
		// 		} else {
		// 			var order_id = newOrder.order_id
		// 			db.query(
		// 				`INSERT INTO Order_detail
		// 				(customer_id, order_status, order_notes,)
		// 				VALUES (?,?,?);`,
		// 				arrayOfPproductIds,
		// 				(error, results, fields) => {
		// 					if (error || results.length != arrayOfPproductIds) {
		// 						res.status(400).send('Not Valid Product Ids');
		// 					} 
		// 				}
		// 			)
		// 		}
		// 	}
		// )


	});

router
	.route('/:id')
	.get(async (req, res, next) => {
		console.log(req.params.id)
		db.query(
			`SELECT 
			o.order_id, o.order_notes, o.datetime_order_placed,
			od.quantity_purchased, 
			os.status_desc, 
			p.product_id, p.product_sku, p.product_price, p.product_name, p.product_quantity, p.product_description, p.image_url, 
			c.first_name, c.middle_name, c.last_name, c.phone_country_code, c.phone,email, c.customer_notes, c.street, c.city, c.zip_code, c.country
			FROM orders o
			INNER JOIN 
			order_detail od
			ON
			o.order_id = od.order_id
			INNER JOIN 
			order_status os
			ON
			o.order_status = os.status_id
			INNER JOIN 
			customers c 
			ON
			c.customer_id = o.customer_id
			INNER JOIN 
			products p
			ON
			p.product_id = od.product_id
			WHERE o.order_id = ?;
			;`,
			[req.params.id],
			(error, results, fields) => {
				if(error || results.length == 0){
					return res.status(400).send("Order Doesnt Exist")
				}
				var results = results.map((mysqlObj, index) => {
					return Object.assign({}, mysqlObj);
				});
				
				let orderData = []
				let processedOrders = {}

				results.forEach(order => {
					if (!processedOrders[order.order_id]){
						processedOrders[order.order_id] = [order.detail_id];
						orderData.push({
							order_id: order.order_id,
							order_notes: order.order_notes,
							datetime_order_placed: order.datetime_order_placed,
							status_desc: order.status_desc,
							customer_detail: {
								first_name: order.first_name,
								middle_name: order.middle_name,
								last_name: order.last_name,
								phone_country_code: order.phone_country_code,
								phone: order.phone,
								email: order.email,
								customer_notes: order.customer_notes,
								street: order.street,
								city: order.city,
								zip_code: order.zip_code,
								country: order.country,
							},
							order_detail:[
								{
									quantity_purchased: order.quantity_purchased,
									product_id: order.product_id, 
									product_sku: order.product_sku, 
									product_price: order.product_price, 
									product_name: order.product_name, 
									product_quantity: order.product_quantity, 
									product_description: order.product_description, 
									image_url: order.image_url,
								}
							]

						})
					} else {
						let orderIndex = orderData.findIndex((orders) => {
							return orders.order_id === order.order_id
						})
						orderData[orderIndex].order_detail.push(
							{
								quantity_purchased: order.quantity_purchased,
								product_id: order.product_id, 
								product_sku: order.product_sku, 
								product_price: order.product_price, 
								product_name: order.product_name, 
								product_quantity: order.product_quantity, 
								product_description: order.product_description, 
								image_url: order.image_url,
							}
						)
					}
				});
				res.json(orderData)

				});
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
