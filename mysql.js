var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3308,
  user     : 'root',
  password : '111111',
  database : 'o2'
});

connection.connect(function(err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
});

connection.query('SELECT id, title from topic', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0]);
});
 
connection.end();