const mysql = require("mysql");
const mysql2 = require("mysql2");
const dotenv = require("dotenv").config();
// var conn = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME

// });
var conn = mysql2.createPool({
  connectionLimit: 10,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: 3306,
  queueLimit: 0,
});

module.exports = conn;
