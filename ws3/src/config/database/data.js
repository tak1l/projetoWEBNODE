const mysql = require('mysql')
const util = require('util')

const con = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : 'root',
  database : 'clientes'
})

const query = util.promisify(con.query).bind(con)

con.connect(err => err ? console.error(err) : console.log('MySQL connected'))

module.exports = query