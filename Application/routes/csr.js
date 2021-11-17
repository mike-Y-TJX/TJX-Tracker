var express = require('express');
var router = express.Router();

var authorization = require("../middleware/authorization")
var authentication = require("../middleware/authentication")



router.post('/login', async (req, res) => {
    const csrAttempt = req.body
        
    // search database for unique customer username and find hashed password
    const dbPassword = "$2a$10$jmfPuNh.ZTVXzE1snRGuNOXaX.w2l.ew.zVDTlKGbXBWTeAWsHapu"

    // authenticate user
    authentication(req, res, csrAttempt, dbPassword);

    
});

// router.get('/protected', authorization, (req, res) => {
//     console.log(req.csr)
//     res.json(req.csr)
// });

// router.get('/unprotected', (req, res) => {
//     console.log(req.csr)
//     res.send("access")
// });


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
