'use strict';
var express = require('express');
var router = express.Router();
const db = require('../config/database/db');
const processedOrders = require("../middleware/processOrders")

router
	.route('/')
	.get(async (req, res, next) => {
		db.query(
			`SELECT 
			o.order_id, o.order_notes, o.datetime_order_placed,
			od.quantity_purchased, 
			os.status_desc, 
			p.product_id, p.product_sku, p.product_price, p.product_name, p.product_quantity, p.product_description, p.image_url, 
			c.customer_id, c.first_name, c.middle_name, c.last_name, c.phone_country_code, c.phone,email, c.customer_notes, c.street, c.city, c.zip_code, c.country
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
				res.json(processedOrders(results))	
			}
		)
	})
	.post(async (req, res, next) => {
		

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

		let checkCustomers = () => {
			return new Promise((resolve, reject) => {
			db.query(
				`SELECT * FROM Customers WHERE customer_id = ?;`,
				[newOrder.customer_id],
				(error, results, fields) => {
					if (error || results.length == 0) {
						return reject('Not A Valid Customer ID')
					} else{
						return resolve()
					}
				}
			)
		})}

		let questionMarkString = ""
		let arrayOfProductIds = []
		let arrayOfProductIdsWithQuantityAdded = []
		newOrder.order_detail.forEach((product, i) => {
			if (i + 1 < newOrder.order_detail.length){
				questionMarkString += "?,"
			} else {
				questionMarkString += "?"
			}	
			arrayOfProductIds.push(product.product_id)
			arrayOfProductIdsWithQuantityAdded.push(
				{product_id:product.product_id, quantity_purchased:product.quantity_purchased}
			)
		})

		let checkProducts = () => {
			return new Promise((resolve, reject) => {
			db.query(
				`SELECT * FROM Products WHERE product_id IN (${questionMarkString});`,
				arrayOfProductIds,
				(error, results, fields) => {
					if (error || results.length != arrayOfProductIds.length) {
						return reject('Not Valid Product Ids')
					} else{
						return resolve()
					}
				}
			)
		})}		

	let checkProductsInStock = () => {
		return new Promise((resolve, reject) => {
			let inStock = [];
			db.query(
				`SELECT product_quantity FROM Products WHERE product_id IN (${questionMarkString});`,
				arrayOfProductIds,
				(error, results, fields) => {
					results.forEach((result, index) => {
						if (
							result.product_quantity <
							arrayOfProductIdsWithQuantityAdded[index].quantity_purchased
						) {
							inStock.push(false);
						} else {
							inStock.push(true);
						}
					});
	
					if (error || inStock.includes(false)) {
						return reject('Not enough quantity in stock')
						// return res.status(400).send('Not enough quantity in stock');
					} else{
						return resolve();
					}
				}
			);
		})
	}
		
		let orderInsert = () => { 
			return new Promise((resolve, reject) => [
			db.query(
				`INSERT INTO Orders
				(customer_id, order_status, order_notes)
				VALUES (?,?,?);`,
				[
					newOrder.customer_id,
					"1",
					newOrder.order_notes
				],
				(error, results, fields) => {
					var order_id = results.insertId
					console.log(order_id)
					if (error || results.length == 0 || !order_id) {
						return reject('Order not added')
					} else {
						return resolve(order_id)
					}
				}
			)
		])
		}

		let insertIntoOrderDetail = (order_id) => { 
			return new Promise((resolve, reject) => {
				let insertQuestionMarkString = ""
				let insertValueArray = []
				arrayOfProductIdsWithQuantityAdded.forEach((product, i) => {
					if (i + 1 < arrayOfProductIdsWithQuantityAdded.length){
						insertQuestionMarkString += "(?,?,?),"
					} else {
						insertQuestionMarkString += "(?,?,?)"
					}	
					insertValueArray.push(order_id, product.product_id, product.quantity_purchased)
				})
	
				db.query(
					`INSERT INTO Order_detail
					(order_id, product_id, quantity_purchased)
					VALUES ${insertQuestionMarkString};`,
					insertValueArray,
					(error, results, fields) => {
						if (error) {
							return reject('Not Valid Product Ids')
							// res.status(400).send();
						} else {
							return resolve()
						}
					}
				)
			})
		}
		
		let retrunInsertIntoOrderDetail = (order_id) => { 
			return new Promise((resolve, reject) => {
				db.query(
					`SELECT 
					o.order_id, o.order_notes, o.datetime_order_placed,
					od.quantity_purchased, 
					os.status_desc, 
					p.product_id, p.product_sku, p.product_price, p.product_name, p.product_quantity, p.product_description, p.image_url, 
					c.customer_id, c.first_name, c.middle_name, c.last_name, c.phone_country_code, c.phone,email, c.customer_notes, c.street, c.city, c.zip_code, c.country
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
					[order_id],
					(error, results, fields) => {
						if(error || results.length == 0){
							return reject("Order Doesnt Exist")
						}
						var results = results.map((mysqlObj, index) => {
							return Object.assign({}, mysqlObj);
						});
						return resolve(processedOrders(results))
					});
			})
		}
		
		try {
			await checkCustomers()	
			await checkProducts()
			await checkProductsInStock()
			let orderID = await orderInsert()
			console.log(orderID)
			await insertIntoOrderDetail(orderID)
			let newOrder = await retrunInsertIntoOrderDetail(orderID)
			res.json(newOrder)
		} catch (error) {
			res.status(400).send(error)
		}



	});

router
	.route('/:id')
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
