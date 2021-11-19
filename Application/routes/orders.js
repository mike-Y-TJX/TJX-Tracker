'use strict';
var express = require('express');
var router = express.Router();
const db = require('../config/database/db');
const processOrders = require('../middleware/processOrders');
const processedOrders = require("../middleware/processOrders")
const generateQuestionMarkStrings = require("../middleware/generateQuestionMarkStrings")

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
					var results = results.map((mysqlObj, index) => {
						return Object.assign({}, mysqlObj);
					});
					
					var costObject = {}
					results.forEach((prod) => {						
						costObject[prod.product_id] = prod.product_price
					})					
					

					if (error || results.length != arrayOfProductIds.length) {
						return reject('Not Valid Product Ids')
					} else{
						return resolve(costObject)
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
		
		let orderInsert = (costObj) => { 
			return new Promise((resolve, reject) => {
			let accum = 0
			console.log(newOrder)

			newOrder.order_detail.forEach((prod) => {
				accum += Number (costObj[String (prod.product_id)])*Number(prod.quantity_purchased)				
			})
			
			accum = Number(parseFloat(accum).toFixed(2))
			db.query(
				`INSERT INTO Orders
				(customer_id, order_status, order_notes, total_order_price)
				VALUES (?,?,?,?);`,
				[
					newOrder.customer_id,
					"1",
					newOrder.order_notes,
					accum
				],
				(error, results, fields) => {
					console.log(error)
					var order_id = results.insertId
					if (error || results.length == 0 || !order_id) {
						return reject('Order not added')
					} else {
						return resolve(order_id)
					}
				}
			)
		})
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
					o.order_id, o.order_notes, o.datetime_order_placed, o.total_order_price,
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
			const costObj = await checkProducts()
			await checkProductsInStock()
			let orderID = await orderInsert(costObj)
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
		// =========Order Info=========
		// can update order_status in upwards only, at anytime
		// can update order_notes at anytime
		// =========Product Info=========
		// only be updated when order_status is draft
		// client wil submit new order_detail array
		// can add a product, remove a product, or change quant purchased

		let orderUpdatesFromClient = req.body
		let order_id = req.params.id

		let databaseOrderCall = (order_id) => {
			return new Promise((resolve, reject) => {
				db.query(
					`SELECT 
					o.order_id, o.order_notes, o.datetime_order_placed, o.total_order_price,
					od.quantity_purchased, od.detail_id,
					os.status_desc, os.status_id,
					c.customer_id, c.first_name, c.middle_name, c.last_name, c.phone_country_code, c.phone,email, c.customer_notes, c.street, c.city, c.zip_code, c.country,
					p.product_id, p.product_sku, p.product_price, p.product_name, p.product_quantity, p.product_description, p.image_url
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
					WHERE o.order_id = ?;`,
					[order_id],
					(error, results, fields) => {
						if(error || results.length == 0){
							
							return reject("Order Doesnt Exist")
						} else {
							var results = results.map((mysqlObj, index) => {
								return Object.assign({}, mysqlObj);
							});
							return resolve(processOrders(results)[0])
						}
				});
			})
		}

		let draftStatusUpdate = (order_id, order_status, order_notes) => {
			return new Promise((resolve, reject) => {
				db.query(
					`UPDATE Orders SET
					order_status = ?,
					order_notes = ?
					WHERE order_id = ?;`,
					[
						order_status,
						order_notes,
						order_id,
					],
					(error, result, fields) => {
						
						if(error){
							console.log("error")
							return reject("database error")
						} else {
							return resolve()
						}
						
					}
				)
			})
		}

		let deleteOrderDetails = (questionMarkString, detailIds) => {
			return new Promise((resolve, reject) => {
				db.query(
					`DELETE FROM Order_detail
					WHERE detail_id IN (${questionMarkString});`,
					detailIds,
					(error, results, fields) => {
						var results = Object.assign({}, results);
						if(results.affectedRows == 0 || error){
							return reject('Orders not deleted')
						} else {
							return resolve()
						}
					}
				)
			})
		}

		let addOrderDetails = (questionMarkString, detailIds) => {
			return new Promise((resolve, reject) => {
				db.query(
					`INSERT INTO Order_detail
					(order_id, product_id, quantity_purchased)
					VALUES 
					${questionMarkString};`,
					detailIds,
					(error, results, fields) => {
						var results = Object.assign({}, results);
						if(results.affectedRows == 0 || error){
							return reject('Orders not added')
						} else {
							return resolve()
						}
					}
				)
			})
		}

		let changeOrderDetails = (quantityPurchased, detailID) => {
			return new Promise((resolve, reject) => {
				db.query(
					`UPDATE order_detail
					SET quantity_purchased = ?
					WHERE detail_id = ?;`,
					[quantityPurchased, detailID],
					(error, results, fields) => {
						var results = Object.assign({}, results);
						if(results.affectedRows == 0 || error){
							return reject('Orders Quantity updated')
						} else {
							return resolve()
						}
					}
				)
			})
		}

		let rollBackHeader = (databaseOrder) => {
			return new Promise((resolve, reject) => {
				if (orderUpdatesFromClient.status_id < databaseOrder.status_id){
					return reject ("Can't Roll Back Status")
				} else {
					return resolve()
				}
			})
		}

		try {
		let databaseOrder = await databaseOrderCall(order_id)
		await rollBackHeader(databaseOrder)
		const promises = [];
		// if database status is draft, you can only increase status or the order notes
		if (databaseOrder.status_id <= 4) {
			console.log("in draft status")
			var addedProductsToOrder = []
			var removedProductsToOrder = []
			var changedProductsQuantityOrder = []
			var clientOrderDetails = orderUpdatesFromClient.order_detail
			var databaseOrderDetails = databaseOrder.order_detail

			
			// find common products (potential quantity change)
			databaseOrderDetails.forEach((dbProduct) => {
				let newQuantity;
				let common = clientOrderDetails.find((clProduct) => {
					var bool = dbProduct.product_id === clProduct.product_id
					if(bool){
						newQuantity = clProduct.quantity_purchased
					}
					return bool
				})
				if(common){
					dbProduct.quantity_purchased = newQuantity
					changedProductsQuantityOrder.push(dbProduct)
				}
			})

			// find added products (in post body not in db)
			clientOrderDetails.forEach((clProduct) => {
				let added = databaseOrderDetails.find((dbProduct) => {
					return dbProduct.product_id === clProduct.product_id
				})
				if(added === undefined){
					addedProductsToOrder.push({...clProduct, order_id})
				}
			})

			// find removed products (in db not in post body)
			databaseOrderDetails.forEach((dbProduct) => {
				let removed = clientOrderDetails.find((clProduct) => {
					return dbProduct.product_id === clProduct.product_id
				})
				if(removed === undefined){
					removedProductsToOrder.push(dbProduct)
				}
			})
			
			if (changedProductsQuantityOrder.length > 0){
				changedProductsQuantityOrder.forEach((detail) => {
					promises.push(changeOrderDetails(detail.quantity_purchased, detail.detail_id))	
				})
			}

			if (addedProductsToOrder.length > 0){
				var [questionMarkStringAdd, ordersToAdd] = generateQuestionMarkStrings("(?,?,?)", addedProductsToOrder, ["product_id", "order_id", "quantity_purchased"])
				var addValuesArray = []			
				ordersToAdd.forEach((detail) => addValuesArray.push(order_id, detail.product_id, detail.quantity_purchased))
				promises.push(
					addOrderDetails(questionMarkStringAdd, addValuesArray)
				)			
			}

			if (removedProductsToOrder.length > 0) {
				var [questionMarkStringRemove, detailIdsRemove] = generateQuestionMarkStrings("?", removedProductsToOrder, ["detail_id"])
				detailIdsRemove = detailIdsRemove.map((detail) => detail.detail_id)
				promises.push(
					deleteOrderDetails(questionMarkStringRemove, detailIdsRemove),
				)			
			}
	
		} 
			console.log("not draft status")
			var finalOrderStatus = orderUpdatesFromClient.status_id || databaseOrder.status_id
			var finalOrderNotes = orderUpdatesFromClient.order_notes || (orderUpdatesFromClient.order_notes === "" ? "" : databaseOrder.order_notes)

			console.log("finalOrderStatus", finalOrderStatus)
			console.log("finalOrderNotes", finalOrderNotes)
			
				if(promises.length > 0){
					await Promise.all(promises)
				}
				await draftStatusUpdate(order_id, finalOrderStatus, finalOrderNotes)
				let updatedOrder = await databaseOrderCall(order_id)
				res.json(updatedOrder)
			} catch (error) {
				res.status(400).send("Order Not Updated")
			}

		
	})
	// will work upon cascading delete implementation
	.delete(async (req, res, next) => {
		let order_id = req.params.id

		let databaseOrderCall = (order_id) => {
			return new Promise((resolve, reject) => {
				db.query(
					`SELECT 
					o.order_id, o.order_notes, o.datetime_order_placed,
					od.quantity_purchased, od.detail_id,
					os.status_desc, os.status_id,
					c.customer_id, c.first_name, c.middle_name, c.last_name, c.phone_country_code, c.phone,email, c.customer_notes, c.street, c.city, c.zip_code, c.country,
					p.product_id, p.product_sku, p.product_price, p.product_name, p.product_quantity, p.product_description, p.image_url
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
					WHERE o.order_id = ?;`,
					[order_id],
					(error, results, fields) => {
						if(error || results.length == 0){
							return reject("Order Doesnt Exist")
							
						} else {
							console.log("ran")
							var results = results.map((mysqlObj, index) => {
								return Object.assign({}, mysqlObj);
							});
							console.log(processOrders(results)[0])
							return resolve(processOrders(results)[0])
						}
				});
			})
		}

		let deleteAnOrder = (order_id) => {
			return new Promise((resolve, reject) => {
				db.query(
					`DELETE FROM Orders
					WHERE order_id = ?;`,
					[order_id],
					(error, results, fields) => {
						var results = Object.assign({}, results);
						console.log(error, results)
						if(error){
							return reject('Order not deleted')
						} else {
							return resolve('Successfully deleted Order')
						}
					}
				)
			})
		}

		let orderStatusCheck = (status_id) => {
			return new Promise((resolve, reject) => {
				if (status_id != 1) {
					return reject ("Order Not Deleted")
				} else {
					return resolve("Order Successfully Deleted")
				}
			})
		}

		try {
			let databaseOrder = await databaseOrderCall(order_id)	
			// if database status is draft, you may delete it
			let resolveMessage = await orderStatusCheck(databaseOrder.status_id)
			await deleteAnOrder(order_id)
			res.status(200).send("Order Successfully Deleted")
		} catch (error) {
			console.log("ran")
			res.status(400).send("Order Not Deleted")
		}

	});

module.exports = router;
