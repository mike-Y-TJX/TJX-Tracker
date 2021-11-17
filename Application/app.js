'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors')
var customerRoutes = require("./routes/customers")
var orderRoutes = require("./routes/orders")
var productRoutes = require("./routes/products")
var mysql = require("mysql")
var router = express.Router();

var server; 
var app = express();

 var db = mysql.createConnection({
    host     : 'tjx-tracker-db.mysql.database.azure.com',
    user     : 'adminuser@tjx-tracker-db',
    password : 'ILoveTJX$2021',
    database : 'stores_selling'
  });

  db.connect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors())
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use("/api/customers", customerRoutes)
// app.use("/api/orders", orderRoutes)
// app.use("/api/products", productRoutes)

app.get("/api/customers", (req, res) => {
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

app.get("/api/customers/:id", (req, res) => {
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

// app.post("/api/customers", (req, res) => {
//     let validCustomer = false;
//     const newCustomer = req.body;
//     console.log("ran")
//     console.log(newCustomer)

//     // validate new customer's data fields - number, name, types
//     if (
//         typeof newCustomer.first_name === 'string' &&
//         typeof newCustomer.middle_name === 'string' &&
//         typeof newCustomer.last_name === 'string' &&
//         typeof newCustomer.phone_country_code === 'number' &&
//         typeof newCustomer.phone === 'number' &&
//         typeof newCustomer.email === 'string' &&
//         typeof newCustomer.customer_notes === 'string' &&
//         typeof newCustomer.street === 'string' &&
//         typeof newCustomer.city === 'string' &&
//         typeof newCustomer.zip_code === 'string' &&
//         typeof newCustomer.country === 'string'
//     ) {
//         validCustomer = true;
//         console.log("ran2")
//     }
        
//     if (!validCustomer) {
//         console.log("ran3")
//         return res.status(400).send('Customer Not Added');
//     }

    
//     db.query(
//         `INSERT INTO Customers
//         (first_name, middle_name, last_name, phone_country_code, phone, email, customer_notes, street, city, zip_code, country)
//         VALUES (?,?,?,?,?,?,?,?,?,?,?);`,
//         [
//             newCustomer.first_name,
//             newCustomer.middle_name,
//             newCustomer.last_name,
//             newCustomer.phone_country_code,
//             newCustomer.phone,
//             newCustomer.email,
//             newCustomer.customer_notes,
//             newCustomer.street,
//             newCustomer.city,
//             newCustomer.zip_code,
//             newCustomer.country,
//         ],
//         (error, results, fields) => {
//             if (error || results.length == 0) {
//                 res.status(400).send('Customer not added');
//             } else {
//                 res.json({...newCustomer, customer_id: results.insertId});
//             }
//         }
//     )
// })

app.delete("/api/customers/:id", (req, res) => {
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
})


// app.get("/api/products", (req, res) => {
// 	db.query(
// 		`SELECT * FROM Products LIMIT 1000;`,
// 		(error, results, fields) => {
// 			if (error || results.length == 0) {
// 				res.status(400).send('No products found');
// 			} else {
// 				res.json(results);
// 			}
// 		}
// 	)
// })

// app.get("/api/products/:id", (req, res) => {
//     db.query(
//         `SELECT * FROM Products WHERE product_id = ?;`,
//         [req.params.id],
//         (error, results, fields) => {
//             if (error || results.length == 0) {
//                 res.status(400).send('No Product Found');
//             } else {
//                 res.json(results);
//             }
//         }
//     )
// })


app.get("/", (req, res) => {
    res.render("index")
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err.status
    });
});

app.set('port', process.env.PORT || 3000);

exports.listen = function () {
    server = app.listen(app.get('port'), function () {
        debug('Express server listening on port ' + server.address().port);
    });
}

exports.close = function () {
    server.close(() => {
        debug('Server stopped.');
    });
}

this.listen();