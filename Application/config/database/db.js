const mysql = require('mysql');
var db = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE
});

db.connect((err) => {
	if(err){
		console.log("database not connecting")
	} else {
		console.log("Database connected")
	}
})

module.exports = db;