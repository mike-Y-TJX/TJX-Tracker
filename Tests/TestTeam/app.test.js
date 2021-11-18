var request = require('supertest');
//const app = require('../../Application/app');
//const screen = require('@testing-library/jest-dom');

request = request('https://tjx-tracker.azurewebsites.net/');


describe('CUSTOMERS', () => {

    describe('GET method for CUSTOMER endpoint', () => {

        //------------TEST FOR ALL CUSTOMERS---------------------------------+

        test("respond with a 200 status code", async () => {

            const response = await request.get("/api/customers")
            expect(response.statusCode).toBe(200)
        })
        test("the response must be customers object", async () => {

            const response = await request.get("/api/customers")
            expect(typeof(response)).toBe("object")
        })
        test("the response must have at least one customer", async () => {

            const response = await request.get("/api/customers")
            expect(response.body).not.toHaveLength(0)
        })


    })

    describe('POST method for CUSTOMER endpoint', () => {
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

    describe('GET method for CUSTOMER ID endpoint', ()=>{

        test('respond with 200 status code for valid customer id', async () =>{
            const testId = "1"
            const response = await request.get(`/api/customers/${testId}`)
            expect(response.statusCode).toBe(200)
        })
        test('respond with 400 status code for invalid customer id', async () =>{
            const testId = "0"
            const response = await request.get(`/api/customers/${testId}`)
            expect(response.statusCode).toBe(400)
        })
        test('respond with No customer found message for invalid customer id', async () =>{
            const testId = "0"
            const response = await request.get(`/api/customers/${testId}`)
            expect(response.text).toBe("No customer found")
        })

    })

    describe('PUT method for CUSTOMER ID endpoint', () => {
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
               
                { "first_name": 12},
                { "middle_name": 12 },
                { "last_name": 12},
                { "phone_country_code": "0" },
                { "phone":  "000000"},
                { "email": 12 },
                { "customer_notes": 12},
                { "street":  12},
                { "city":  21},
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

    describe('DELETE method for CUSTOMER ID endpoint', ()=>{

        test("return a 200 status code for deleted customer", async () => {

            const first_response = await request.get("/api/customers")

            globalThis.last_customer_id = first_response.body[first_response.body.length-1]["customer_id"]
            globalThis.last_customer_firstname_old = first_response.body[first_response.body.length-1]["first_name"]
            
            const response = await request.delete(`/api/customers/${last_customer_id}`)
            expect(response.statusCode).toBe(200)

            
    
        })
        test("return undefined when probed for previously deleted customer", async () => {
            const response = await request.get(`/api/customers/${last_customer_id}`)
            expect(response.body.length).toBe(undefined)
        })

    })





})
