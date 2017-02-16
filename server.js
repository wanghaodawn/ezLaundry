const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const model = require('./model.js');
const mysql = require('mysql');

var app = express();
const port = 3000;

// Configurate the connection to MySQL
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'laundry_helper'
});

// Message to be sent to browser
const SUCCESS = 'SUCCESS';
const FAIL = 'FAIL';
const DUPLICATE_PRIMARY_KEY = 'DUPLICATE_PRIMARY_KEY';
const MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS';
const ITEM_DOESNT_EXIST = 'ITEM_DOESNT_EXIST';
const INCORRECT_QUERY = 'INCORRECT_QUERY';

// Configuration
hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));


// Middleware - Generate logs of the server
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
// Create a user
app.get('/api/add_user?', (req, res) => {
    var query = url.parse(req.url, true).query;
    // console.log(query);
    if (JSON.stringify(query) == '{}') {
        // console.log('null_query');
        res.render('result.hbs', {
            // Fail, return
            result: MISSING_REQUIRED_FIELDS
        });
    } else {
        // If any of the required fields is missing, then return
        if (!query.username || !query.password) {
            res.render('result.hbs', {
                result: MISSING_REQUIRED_FIELDS
            });
        }
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
        // console.log(user);
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM users WHERE username=?;';
        connection.query(queryString1, user.username, function(err, rows) {
            if (err) {
                res.render('result.hbs', {
                    // Fail, return
                    result: FAIL
                });
            } else {
                var count = rows[0].COUNT;
                if (count != 0) {
                    // If find dumplicate primary keys in the database, return
                    res.render('result.hbs', {
                        result: DUPLICATE_PRIMARY_KEY
                    });
                } else {
                    const queryString2 = 'INSERT INTO users SET ?;';
                    connection.query(queryString2, user, function(err, rows) {
                        if (err) {
                            // Fail, return
                            res.render('result.hbs', {
                                result: FAIL
                            });
                        } else {
                            // Success
                            res.render('result.hbs', {
                                result: SUCCESS
                            });
                        }
                    });
                }
            }
        });
    }
});


// Delte users
app.get('/api/delete_user?', (req, res) => {
    var query = url.parse(req.url, true).query;
    console.log(query);
    if (JSON.stringify(query) == '{}') {
        // console.log('null_query');
        res.render('result.hbs', {
            // Fail, return
            result: MISSING_REQUIRED_FIELDS
        });
    } else {
        // Use escape to prevent from SQL Injection
        const user = {
            'username': connection.escape(toLowerCase(query.username)),
            'delete_all': connection.escape(toLowerCase(query.delete_all))
        };
        console.log(user);
        if (query.username && !query.delete_all) {
            // Delete one user
            const queryString1 = 'SELECT COUNT(*) AS COUNT FROM users WHERE username=?;';
            connection.query(queryString1, user.username, function(err, rows) {
                if (err) {
                    res.render('result.hbs', {
                        // Fail, return
                        result: FAIL
                    });
                } else {
                    var count = rows[0].COUNT;
                    if (count != 1) {
                        // If cannot find the item,then return
                        res.render('result.hbs', {
                            result: ITEM_DOESNT_EXIST
                        });
                    } else {
                        const queryString2 = 'DELETE FROM users WHERE username=?;';
                        connection.query(queryString2, user.username, function(err, rows) {
                            if (err) {
                                // Fail, return
                                res.render('result.hbs', {
                                    result: FAIL
                                });
                            } else {
                                // Success
                                res.render('result.hbs', {
                                    result: SUCCESS
                                });
                            }
                        });
                    }
                }
            });
        } else if (query.delete_all && !query.username && query.delete_all.toLowerCase() == 'true') {
            // Delete all users
            const queryString = 'DELETE FROM users;';
            connection.query(queryString, user.username, function(err, rows) {
                if (err) {
                    // Fail, return
                    res.render('result.hbs', {
                        result: FAIL
                    });
                } else {
                    // Success
                    res.render('result.hbs', {
                        result: SUCCESS
                    });
                }
            });
        } else if ((query.delete_all && query.username) || (query.delete_all && !query.username && query.delete_all.toLowerCase() != 'true')) {
            // The query provided is incorrect
            res.render('result.hbs', {
                result: INCORRECT_QUERY
            });
        } else {
            // If any of the required fields is missing, then return
            res.render('result.hbs', {
                result: MISSING_REQUIRED_FIELDS
            });
        }
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
