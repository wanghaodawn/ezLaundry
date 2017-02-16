const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const model = require('./model.js');
const mysql = require('mysql');

var app = express();
const port = 3000;

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'laundry_helper'
});

// Possible return string for result
const SUCCESS = 'SUCCESS';
const FAIL = 'FAIL';

// Configuration
hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));


// Middleware
app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;

  console.log(log);
  fs.appendFile('server.log', log + '\n', (err) => {
    if (err) {
      console.log('Unable to append to file system');
    }
  });
  next();
});




// RESTful APIs
app.get('/api/add_user?', (req, res) => {
    var query = url.parse(req.url, true).query;
    console.log(query);
    if (JSON.stringify(query) == '{}') {
        console.log('null_query');
    } else {
        // Use escape to prevent from SQL Injection
        const user = {
            'username': connection.escape(toLowerCase(query.username)),
            'firstname': connection.escape(toLowerCase(query.firstname)),
            'lastname': connection.escape(toLowerCase(query.lastname)),
            'password': connection.escape(query.password),
            'address': connection.escape(toLowerCase(query.address)),
            'zip': connection.escape(toLowerCase(query.zip)),
            'city': connection.escape(toLowerCase(query.city)),
            'state': connection.escape(toLowerCase(query.state)),
            'country': connection.escape(toLowerCase(query.country))
        };
        console.log(user);
        const queryString = 'INSERT INTO users SET ?;';
        connection.query(queryString, user, function(err, rows) {
            if (err) {
                res.render('result.hbs', {
                    result: FAIL
                });
            } else {
                res.render('result.hbs', {
                    result: SUCCESS
                });
            }
        });
    }
});


// Start the server
app.listen(port);
console.log(`Starting server at localhost:${port}`);



// If the string is not null, then change it to lowercase
function toLowerCase(s) {
    if (s) {
        return s.toLowerCase();
    }
    return s;
}
