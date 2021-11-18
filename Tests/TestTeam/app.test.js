var request = require('supertest');
//const app = require('../../Application/app');
//const screen = require('@testing-library/jest-dom');

request = request('https://tjx-tracker.azurewebsites.net/');


describe('CUSTOMERS', () => {

    describe('GET method for CUSTOMER endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------

        test("respond with a 200 status code", async () => {

            const response = await request.get("/api/customers")
            expect(response.statusCode).toBe(200)
        })
        test("the response must be customers object", async () => {

            const response = await request.get("/api/customers")
            expect(typeof (response)).toBe("object")
        })
        test("the response must have at least one customer", async () => {

            const response = await request.get("/api/customers")
            expect(response.body).not.toHaveLength(0)
        })


    })
    describe('POST method for CUSTOMER endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------

        test('responds with 200 OK', async () => {
            const response = await request
                .post("/api/customers")
                .send({

                    "first_name": "testuser",
                    "middle_name": "D",
                    "last_name": "Luffy",
                    "phone_country_code": 0,
                    "phone": 4155551,
                    "email": "luffy@gmail.com",
                    "customer_notes": "pirate king",
                    "street": "grand line",
                    "city": "east blue",
                    "zip_code": "B5J 4X1",
                    "country": "one piece"
                })
                .set('Accept', 'application/json')
                .expect(200)



        })
        test('should specify json in the content type header', async () => {
            const response = await request.post("/api/customers")
                .send({
                    "customer_id": 1004,
                    "first_name": "testuser",
                    "middle_name": "D",
                    "last_name": "Luffy",
                    "phone_country_code": 0,
                    "phone": 4155551,
                    "email": "luffy@gmail.com",
                    "customer_notes": "pirate king",
                    "street": "grand line",
                    "city": "east blue",
                    "zip_code": "B5J 4X1",
                    "country": "one piece"
                })
                .set('Accept', 'application/json')

            expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))

        })
        test('response has customer Id', async () => {
            const response = await request.post("/api/customers")
                .send({
                    "customer_id": 1004,
                    "first_name": "testuser",
                    "middle_name": "D",
                    "last_name": "Luffy",
                    "phone_country_code": 0,
                    "phone": 4155551,
                    "email": "luffy@gmail.com",
                    "customer_notes": "pirate king",
                    "street": "grand line",
                    "city": "east blue",
                    "zip_code": "B5J 4X1",
                    "country": "one piece"
                })
                .set('Accept', 'application/json')

            expect(response.body.customer_id).toBeDefined()

        })

        //------- TESTS FOR WHEN REQUESTS SHOULD NOT GO WELL------------------------------------------

        test('should respond with a status code of 400 and appropriate message for invalid post', async () => {

            const bodyData = [
                { "customer_id": 1004 },
                { "first_name": "testuser" },
                { "middle_name": "D" },
                { "last_name": "Luffy" },
                { "phone_country_code": 0 },
                { "phone": 4155551 },
                { "email": "luffy@gmail.com" },
                { "customer_notes": "pirate king" },
                { "street": "grand line" },
                { "city": "east blue" },
                { "zip_code": "B5J 4X1" },
                { "country": "one piece" },
                {}

            ]

            for (const body of bodyData) {
                const response = await request.post("/api/customers").send(body)
                expect(response.statusCode).toBe(400)
                expect(response.text).toBe("Customer Not Added")
            }

        })
    })

    describe('GET method for CUSTOMER ID endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------

        test('respond with 200 status code for valid customer id', async () => {
            const testId = "1"
            const response = await request.get(`/api/customers/${testId}`)
            expect(response.statusCode).toBe(200)
        })
        //------- TESTS FOR WHEN REQUESTS SHOULD NOT GO WELL------------------------------------------
        test('respond with 400 status code for invalid customer id', async () => {
            const testId = "0"
            const response = await request.get(`/api/customers/${testId}`)
            expect(response.statusCode).toBe(400)
        })
        test('respond with No customer found message for invalid customer id', async () => {
            const testId = "0"
            const response = await request.get(`/api/customers/${testId}`)
            expect(response.text).toBe("No customer found")
        })

    })
    describe('PUT method for CUSTOMER ID endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------

        test('responds with 200 OK', async () => {

            const response = await request
                .put("/api/customers/1")
                .send({
                    "customer_id": 1,
                    "first_name": "testuser",
                    "middle_name": "D",
                    "last_name": "Luffy",
                    "phone_country_code": 0,
                    "phone": 4155551,
                    "email": "luffy@gmail.com",
                    "customer_notes": "pirate king",
                    "street": "grand line",
                    "city": "east blue",
                    "zip_code": "B5J 4X1",
                    "country": "one piece"
                })
                .set('Accept', 'application/json')
                .expect(200)

        })

        //------- TESTS FOR WHEN REQUESTS SHOULD NOT GO WELL------------------------------------------
        test('responds with 400 status code for invalid PUT request', async () => {

            const response = await request
                .put("/api/customers/0")
                .send({

                    "first_name": "testuser",
                    "middle_name": "D",
                    "last_name": "Luffy",
                    "phone_country_code": 0,
                    "phone": 4155551,
                    "email": "luffy@gmail.com",
                    "customer_notes": "pirate king",
                    "street": "grand line",
                    "city": "east blue",
                    "zip_code": "B5J 4X1",
                    "country": "one piece"
                })
                .set('Accept', 'application/json')
                .expect(400)
            expect(response.text).toBe("Invalid Customer")

        })

        test('should respond with a status code of 400 and appropriate message for invalid parameters', async () => {

            const bodyData = [

                { "first_name": 12 },
                { "middle_name": 12 },
                { "last_name": 12 },
                { "phone_country_code": "0" },
                { "phone": "000000" },
                { "email": 12 },
                { "customer_notes": 12 },
                { "street": 12 },
                { "city": 21 },
                { "zip_code": 21 },
                { "country": 12 },


            ]

            for (const body of bodyData) {
                const testId = "1"

                const response = await request.put(`/api/customers/${testId}`).send(body)
                expect(response.statusCode).toBe(400)
                expect(response.text).toBe("Invalid Parameters")
            }

        })

    })
    describe('DELETE method for CUSTOMER ID endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------

        test("return a 200 status code for deleted customer", async () => {

            const first_response = await request.get("/api/customers")

            globalThis.last_customer_id = first_response.body[first_response.body.length - 1]["customer_id"]
            globalThis.last_customer_firstname_old = first_response.body[first_response.body.length - 1]["first_name"]

            const response = await request.delete(`/api/customers/${last_customer_id}`)
            expect(response.statusCode).toBe(200)



        })
        test("return undefined when probed for previously deleted customer", async () => {
            const response = await request.get(`/api/customers/${last_customer_id}`)
            expect(response.body.length).toBe(undefined)
        })

    })

})

describe('PRODUCTS', () => {


    describe('GET method for PRODUCTS endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------
        test("respond with a 200 status code", async () => {

            const response = await request.get("/api/products")
            expect(response.statusCode).toBe(200)
        })
        test("the response must be products object", async () => {

            const response = await request.get("/api/products")
            expect(typeof (response)).toBe("object")
        })
        test("the response must have at least one product", async () => {

            const response = await request.get("/api/products")
            expect(response.body).not.toHaveLength(0)
        })


    })
    describe('POST method for PRODUCTS endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------

        test('responds with 200 OK', async () => {
            const response = await request
                .post("/api/products")
                .send({
                    "product_sku": "testSku",
                    "product_price": 29.99,
                    "product_name": "testproduct_name",
                    "product_quantity": 9,
                    "product_description": "testdesc",
                    "image_url": "//img.tjmaxx.com/tjx?set=DisplayName[e8],prd[1000699708_NS1402311],ag[no]&call=url[file:tjxrPRD2.chain]"
                })
                .set('Accept', 'application/json')
                .expect(200)



        })
        test('should specify json in the content type header', async () => {
            const response = await request.post("/api/products")
                .send({
                    "product_sku": "testSku",
                    "product_price": 29.99,
                    "product_name": "testproduct_name",
                    "product_quantity": 9,
                    "product_description": "testdesc",
                    "image_url": "//img.tjmaxx.com/tjx?set=DisplayName[e8],prd[1000699708_NS1402311],ag[no]&call=url[file:tjxrPRD2.chain]"
                })
                .set('Accept', 'application/json')

            expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))

        })
        test('response has product Id', async () => {
            const response = await request.post("/api/products")
                .send({
                    "product_sku": "testSku",
                    "product_price": 29.99,
                    "product_name": "testproduct_name",
                    "product_quantity": 9,
                    "product_description": "testdesc",
                    "image_url": "//img.tjmaxx.com/tjx?set=DisplayName[e8],prd[1000699708_NS1402311],ag[no]&call=url[file:tjxrPRD2.chain]"
                })
                .set('Accept', 'application/json')

            expect(response.body.product_id).toBeDefined()

        })
        //------- TESTS FOR WHEN REQUESTS SHOULD NOT GO WELL------------------------------------------
        test('should respond with a status code of 400 and appropriate message for invalid parameters', async () => {

            const bodyData = [

                { "product_sku": "testSku" },
                { "product_price": 29.99 },
                { "product_name": "testproduct_name" },
                { "product_quantity": 9 },
                { "product_description": "testdesc" },
                { "image_url": "//img.tjmaxx.com/tjx?set=DisplayName[e8],prd[1000699708_NS1402311],ag[no]&call=url[file:tjxrPRD2.chain]" },
                {},
            ]

            for (const body of bodyData) {
                const testId = "1"

                const response = await request.post("/api/products").send(body)
                expect(response.statusCode).toBe(400)
                expect(response.text).toBe("Product Not Added")
            }

        })

    })
    describe('GET method for PRODUCTS ID endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------

        test('respond with 200 status code for valid product id', async () => {
            const testId = "1"
            const response = await request.get(`/api/products/${testId}`)
            expect(response.statusCode).toBe(200)
        })

        //------- TESTS FOR WHEN REQUESTS SHOULD NOT GO WELL------------------------------------------

        test('respond with 400 status code for invalid products id', async () => {
            const testId = "0"
            const response = await request.get(`/api/products/${testId}`)
            expect(response.statusCode).toBe(400)
        })
        test('respond with No Product Found message for invalid products id', async () => {
            const testId = "0"
            const response = await request.get(`/api/products/${testId}`)
            expect(response.text).toBe("No Product Found")
        })

    })
    describe('PUT method for PRODUCTS ID endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------

        test('responds with 200 OK', async () => {

            const response = await request
                .put("/api/products/1")
                .send({
                    "product_sku": "testSku",
                    "product_price": 29.99,
                    "product_name": "testproduct_name",
                    "product_quantity": 9,
                    "product_description": "testdesc",
                    "image_url": "//img.tjmaxx.com/tjx?set=DisplayName[e8],prd[1000699708_NS1402311],ag[no]&call=url[file:tjxrPRD2.chain]"
                })
                .set('Accept', 'application/json')
                .expect(200)

        })
        //------- TESTS FOR WHEN REQUESTS SHOULD NOT GO WELL------------------------------------------
        test('responds with 400 status code for PUT request to invalid product_id', async () => {

            const response = await request
                .put("/api/products/0")
                .send({
                    "product_sku": "testSku",
                    "product_price": 29.99,
                    "product_name": "testproduct_name",
                    "product_quantity": 9,
                    "product_description": "testdesc",
                    "image_url": "//img.tjmaxx.com/tjx?set=DisplayName[e8],prd[1000699708_NS1402311],ag[no]&call=url[file:tjxrPRD2.chain]"
                })
                .set('Accept', 'application/json')
                .expect(400)
            expect(response.text).toBe("Invalid Product")

        })

        test("should respond with a status code of 400 and 'Invalid Parameters' for invalid parameters", async () => {

            const bodyData = [

                { "product_sku": 0 },
                { "product_price": "29.99" },
                { "product_name": 12 },
                { "product_quantity": "9" },
                { "product_description": 11 },
                { "image_url": 1 },
            ]

            for (const body of bodyData) {
                const testId = "1"

                const response = await request.put(`/api/products/${testId}`).send(body)
                expect(response.statusCode).toBe(400)
                expect(response.text).toBe("Invalid Parameters")
            }

        })

    })
    describe('DELETE method for PRODUCTS ID endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------

        test("return a 200 status code for deleted product", async () => {

            const first_response = await request.get("/api/products")

            globalThis.last_product_id = first_response.body[first_response.body.length - 1]["product_id"]
            globalThis.last_product_sku = first_response.body[first_response.body.length - 1]["product_sku"]

            const response = await request.delete(`/api/customers/${last_product_id}`)
            expect(response.statusCode).toBe(200)

        })
        test("return undefined when probed for previously deleted customer", async () => {
            const response = await request.get(`/api/customers/${last_product_id}`)
            expect(response.body.length).toBe(undefined)
        })

    })
})

describe('ORDERS', () => {
    describe('GET method for ORDERS endpoint', () => {
        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------
        test("respond with a 200 status code", async () => {

            const response = await request.get("/api/orders")
            expect(response.statusCode).toBe(200)
        })
        test("the response must be orders object", async () => {

            const response = await request.get("/api/orders")
            expect(typeof (response)).toBe("object")
        })
        test("the response must have at least one order", async () => {

            const response = await request.get("/api/orders")
            expect(response.body).not.toHaveLength(0)
        })

    })
    describe('POST method for ORDERS endpoint', () => {
        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------
        test('responds with 200 OK', async () => {
            const response = await request
                .post("/api/orders")
                .send({

                    "order_notes": "testing team",
                    "customer_id": 1,
                    "order_detail": [
                        {
                            "quantity_purchased": 1,
                            "product_id": 1
                        }
                    ]

                })
                .set('Accept', 'application/json')
                .expect(200)



        })
        test('should specify json in the content type header', async () => {
            const response = await request.post("/api/orders")
                .send({

                    "order_notes": "testing team",
                    "customer_id": 1,
                    "order_detail": [
                        {
                            "quantity_purchased": 1,
                            "product_id": 1
                        }
                    ]
                })
                .set('Accept', 'application/json')

            expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))

        })
        test('response has orders Id', async () => {
            const response = await request.post("/api/orders")
                .send({
                    "order_notes": "testing team",
                    "customer_id": 1,
                    "order_detail": [
                        {
                            "quantity_purchased": 1,
                            "product_id": 1
                        }
                    ]
                })
                .set('Accept', 'application/json')

            expect(response.body[0].order_id).toBeDefined()
        })
        //------- TESTS FOR WHEN REQUESTS SHOULD NOT GO WELL------------------------------------------
        test("should respond with 'Not A Valid Customer ID' for posting with invalid customer id", async () => {
            const response = await request
                .post("/api/orders")
                .send({

                    "order_notes": "testing team",
                    "customer_id": 0,
                    "order_detail": [
                        {
                            "quantity_purchased": 1,
                            "product_id": 1
                        }
                    ]
                })
                .set('Accept', 'application/json')
            expect(response.text).toBe("Not A Valid Customer ID")

        })
        test("should respond with 400 for posting with invalid quantity purchased", async () => {
            const response = await request
                .post("/api/orders")
                .send({
                    "order_notes": "testing team",
                    "customer_id": 1,
                    "order_detail": [
                        {
                            "quantity_purchased": 0,
                            "product_id": 1
                        }
                    ]
                })
                .set('Accept', 'application/json')
                .expect(400)

        })
        test("should respond with 'Not Valid Product Ids' for posting with invalid product id", async () => {
            const response = await request
                .post("/api/orders")
                .send({

                    "order_notes": "testing team",
                    "customer_id": 1,
                    "order_detail": [
                        {
                            "quantity_purchased": 1,
                            "product_id": 0
                        }
                    ]
                })
                .set('Accept', 'application/json')
            expect(response.text).toBe('Not Valid Product Ids')
        })
        test("should respond with 'Not enough quantity in stock' when order demand outweighs supply", async () => {
            const response = await request
                .post("/api/orders")
                .send({

                    "order_notes": "testing team",
                    "customer_id": 1,
                    "order_detail": [
                        {
                            "quantity_purchased": 10000000000,
                            "product_id": 1
                        }
                    ]
                })
                .set('Accept', 'application/json')
            expect(response.text).toBe('Not enough quantity in stock')
        })
    })
    describe('GET method for ORDERS ID endpoint', () => {

        //------- TESTS FOR WHEN REQUESTS SHOULD GO WELL------------------------------------------

        test('respond with 200 status code for valid order id', async () => {
            const testId = "129"
            const response = await request.get(`/api/orders/${testId}`)
            expect(response.statusCode).toBe(200)
        })
        //------- TESTS FOR WHEN REQUESTS SHOULD NOT GO WELL------------------------------------------

        test('respond with 400 status code for invalid order id', async () => {
            const testId = "0"
            const response = await request.get(`/api/orders/${testId}`)
            expect(response.statusCode).toBe(400)
        })
        test("respond with 'Order Doesnt Exist' message for invalid orders id", async () => {
            const testId = "0"
            const response = await request.get(`/api/orders/${testId}`)
            expect(response.text).toBe("Order Doesnt Exist")
        })

    })





})
