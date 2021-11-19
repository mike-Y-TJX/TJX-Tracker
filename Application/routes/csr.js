var express = require('express');
var router = express.Router();

var authorization = require("../middleware/authorization")
var authentication = require("../middleware/authentication")
const db = require('../config/database/db');


router.post('/login', async (req, res) => {
    const csrAttempt = req.body

    db.query(
        `SELECT * 
        FROM customer_service_reps
        WHERE email = ?;`,
        [csrAttempt.email],
        (error, results, fields) => {
            var resultsArray = results.map((mysqlObj, index) => {
                return Object.assign({}, mysqlObj);
            });
            if(resultsArray.length == 0){
                return res.status(401).send("Incorrect Email Or Password")
            }
            console.log(csrAttempt)
            console.log(resultsArray[0].rep_password)
            authentication(req, res, csrAttempt, resultsArray[0].rep_password);

        }
    )
        
});

router.get('/protected', authorization, (req, res) => {
    res.json("your in")
});

router.get('/unprotected', (req, res) => {
    res.send("access")
});


// router.post('/gencsr', (req, res) => {
//     const {name, password} = req.body
//     console.log("name", name)
//     console.log("password", password)

//     bcrypt.hash(password, 10, function(err, hash) {
//         console.log("name", name)
//         console.log("hash", hash)
//         res.status(200).send("ok")
//     })

// });

module.exports = router;
