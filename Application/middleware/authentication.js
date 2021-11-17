var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken")

module.exports = (req, res, csrAttempt, dbPassword) => {
    bcrypt.compare(csrAttempt.rep_password, dbPassword, function(err, result) {
        if(result){
            const csr = {email: csrAttempt.email}
            const sessionAuth = jwt.sign(csr, process.env.ACCESS_TOKEN_SECRET)
            res.status(200)
            res.json({sessionToken: sessionAuth})
        } else {
            return res.status(401).send("incorrect username or password")
        }
    });
}