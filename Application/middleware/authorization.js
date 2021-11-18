var jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    const authHead = req.headers["authorization"]
    console.log(authHead)
    const token = authHead && authHead.split(" ")[1]
    console.log(token)
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, csr) => {
          if (err)  {
            return res.status(403).send("Access Denied")
          } else {
            req.csr = csr
            next()
          }
        })
    } else {
        return res.status(401).send("Access Denied")
    }
}