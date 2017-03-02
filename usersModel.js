const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const moment = require('moment');

const helper = require('./helper.js');

module.exports = {
    createUser : function (GoogleMapAPIKey, connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            // Fail, return
            return callback({message: helper.MISSING_REQUIRED_FIELDS, user: null});
        }
        // If any of the required fields is missing, then return
        if (!query.username) {
            return callback({message: helper.MISSING_USERNAME, user: null});
        }
        if (!query.password) {
            return callback({message: helper.MISSING_PASSWORD, user: null});
        }
        if (!query.property_name) {
            return callback({message: helper.MISSING_PROPERTY_NAME, user: null});
        }

        // console.log(user);
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM users WHERE username=?;';
        // console.log(queryString1);
        connection.query(queryString1, connection.escape(helper.toLowerCase(query.username)), function(err, rows) {
            if (err) {
                return callback({message: helper.FAIL, user: null});
            }
            var count = rows[0].COUNT;
            if (count != 0) {
                // If find dumplicate primary keys in the database, return
                return callback({message: helper.DUPLICATE_PRIMARY_KEY, user: null});
            }
            var user = {
                'username':      connection.escape(helper.toLowerCase(query.username)),
                'password':      connection.escape(query.password),
                'property_name': connection.escape(helper.toLowerCase(query.property_name)),
            };
            var res_message = '';
            if ('address' in query &&'city' in query) {
                // Use escape to prevent from SQL Injection
                const address = helper.toLowerCase(query.address);
                const city = helper.toLowerCase(query.city);

                // Get user's desired apartment's latitude and longitude
                helper.getLocation(GoogleMapAPIKey, address, city, function(res) {
                    console.log(JSON.stringify(res));
                    res_message = res.message;
                    // console.log(res_message);
                    // console.log(helper.SUCCESS);
                    // console.log(res_message == helper.SUCCESS);
                    if (res_message == helper.SUCCESS) {
                        user['latitude'] = res.latitude;
                        user['longitude'] = res.longitude;
                    }
                    const queryString2 = 'INSERT INTO users SET ?;';
                    connection.query(queryString2, user, function(err, rows) {
                        if (err) {
                            return callback({message: helper.FAIL, user: null});
                        }
                        const queryString3 = 'SELECT * FROM users WHERE username=?;';
                        connection.query(queryString3, user.username, function(err, rows) {
                            // console.log(err);
                            if (err) {
                                return callback({message: helper.FAIL, user: null});
                            }
                            if (res_message == helper.ZERO_RESULTS) {
                                return callback({message: helper.ZERO_RESULTS, user: rows[0]});
                            }
                            return callback({message: helper.SUCCESS, user: rows[0]});
                        });
                    });
                });
            } else {
                const queryString2 = 'INSERT INTO users SET ?;';
                connection.query(queryString2, user, function(err, rows) {
                    if (err) {
                        return callback({message: helper.FAIL, user: null});
                    } else {
                        const queryString3 = 'SELECT * FROM users WHERE username=?;';
                        connection.query(queryString3, user.username, function(err, rows) {
                            // console.log(err);
                            if (err) {
                                return callback({message: helper.FAIL, user: null});
                            } else {
                                return callback({message: helper.SUCCESS, user: rows[0]});
                            }
                        });
                    }
                });
            }
        });
    },


    loginUser : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            // Fail, return
            return callback({message: helper.MISSING_REQUIRED_FIELDS, user: null});
        }
        // If any of the required fields is missing, then return
        if (!query.username) {
            return callback({message: helper.MISSING_USERNAME, user: null});
        }
        if (!query.password) {
            return callback({message: helper.MISSING_PASSWORD, user: null});
        }
        // Use escape to prevent from SQL Injection
        const user = {
            'username':     connection.escape(helper.toLowerCase(query.username)),
            'password':     connection.escape(query.password)
        };
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM users WHERE username=?;';
        // console.log(queryString1);
        connection.query(queryString1, user.username, function(err, rows) {
            if (err) {
                return callback({message: helper.FAIL, user: null});
            }
            var count = rows[0].COUNT;
            if (count != 1) {
                // If find dumplicate primary keys in the database, return
                return callback({message: helper.USER_DOESNT_EXISTS, user: null});
            }
            // console.log(username);
            // console.log(password);
            const queryString2 = 'SELECT * FROM users WHERE username=?;';
            connection.query(queryString2, user.username, function(err, rows) {
                // console.log(err);
                if (err) {
                    return callback({message: helper.FAIL, user: null});
                }
                var originalPassword = rows[0].password;
                console.log(originalPassword);
                console.log(user.password);
                if (originalPassword != user.password) {
                    return callback({message: helper.WRONG_PASSWORD, user: null});
                }
                return callback({message: helper.SUCCESS, user: rows[0]});
            });
        });
    },



    deleteOneUser : function(connection, query, res, callback) {
        console.log(query);
        if (JSON.stringify(query) == '{}') {
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
        // Use escape to prevent from SQL Injection
        const user = {
            'username': connection.escape(helper.toLowerCase(query.username))
        };
        // console.log(user);
        if (query.username) {
            // Delete one user
            const queryString1 = 'SELECT COUNT(*) AS COUNT FROM users WHERE username=?;';
            connection.query(queryString1, user.username, function(err, rows) {
                if (err) {
                    return callback({message: helper.FAIL});
                }
                var count = rows[0].COUNT;
                if (count != 1) {
                    // If cannot find the item,then return
                    return callback({message: helper.ITEM_DOESNT_EXIST});
                }
                const queryString2 = 'DELETE FROM users WHERE username=?;';
                connection.query(queryString2, user.username, function(err, rows) {
                    if (err) {
                        // Fail, return
                        return callback({message: helper.FAIL});
                    }
                    // Success
                    return callback({message: helper.SUCCESS});
                });
            });
        } else {
            // If any of the required fields is missing, then return
            return callback({message: helper.MISSING_USERNAME});
        }
    },



    deleteAllUsers : function(connection, query, res, callback) {
        console.log(query);
        if (JSON.stringify(query) == '{}') {
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
        // Use escape to prevent from SQL Injection
        const user = {
            'delete_all': connection.escape(helper.toLowerCase(query.delete_all))
        };
        // console.log(user);
        if (query.delete_all && query.delete_all.toLowerCase() == 'true') {
            // Delete all users
            const queryString = 'DELETE FROM users;';
            connection.query(queryString, function(err, rows) {
                if (err) {
                    // Fail, return
                    return callback({message: helper.FAIL});
                }
                // Success
                return callback({message: helper.SUCCESS});
            });
        } else {
            // If any of the required fields is missing, then return
            return callback({message: helper.MISSING_DELETE_ALL});
        }
    },



    // Show all users
    showAllUsers : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback({message: helper.MISSING_REQUIRED_FIELDS, user: null});
        }
        // Use escape to prevent from SQL Injection
        const schedule = {
            'show_all': connection.escape(helper.toLowerCase(query.show_all))
        };
        // console.log(machine);
        if (query.show_all && query.show_all.toLowerCase() == 'true') {
            // Delete all machines
            const queryString = 'SELECT * FROM users;';
            connection.query(queryString, function(err, rows) {
                if (err) {
                    // Fail, return
                    return callback({message: helper.FAIL, user: null});
                }
                // Success
                result = helper.normalizeUsers(rows);
                return callback({message: helper.SUCCESS, user: result});
            });
        } else {
            // If any of the required fields is missing, then return
            return callback({message: helper.MISSING_SHOW_ALL, user: null});
        }
    },



    login : function (connection, username, password, callback) {
        username = connection.escape(helper.toLowerCase(username));
        password = connection.escape(password);
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM users WHERE username=?;';
        // console.log(queryString1);
        connection.query(queryString1, username, function(err, rows) {
            if (err) {
                return callback({message: helper.FAIL, user: null});
            }
            var count = rows[0].COUNT;
            if (count != 1) {
                // If find dumplicate primary keys in the database, return
                return callback({message: helper.USER_DOESNT_EXISTS, user: null});
            }
            // console.log(username);
            // console.log(password);
            const queryString2 = 'SELECT * FROM users WHERE username=?;';
            connection.query(queryString2, username, function(err, rows) {
                // console.log(err);
                if (err) {
                    return callback({message: helper.FAIL, user: null});
                }
                var originalPassword = rows[0].password;
                console.log(originalPassword);
                console.log(password);
                if (originalPassword != password) {
                    return callback({message: helper.WRONG_PASSWORD, user: null});
                }
                return callback({message: helper.SUCCESS, user: rows[0]});
            });
        });
    },



    register : function (connection, inputUser, callback) {
        const user = {
            'username':     connection.escape(helper.toLowerCase(inputUser.username)),
            'firstname':    connection.escape(helper.toLowerCase(inputUser.firstname)),
            'lastname':     connection.escape(helper.toLowerCase(inputUser.lastname)),
            'password':     connection.escape(inputUser.password),
            'address':      connection.escape(helper.toLowerCase(inputUser.address)),
            'zip':          connection.escape(helper.toLowerCase(inputUser.zip)),
            'city':         connection.escape(helper.toLowerCase(inputUser.city)),
            'state':        connection.escape(helper.toLowerCase(inputUser.state)),
            'country':      connection.escape(helper.toLowerCase(inputUser.country))
        };
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM users WHERE username=?;';
        // console.log(queryString1);
        connection.query(queryString1, user.username, function(err, rows) {
            if (err) {
                return callback({message: helper.FAIL, user: null});
            }
            var count = rows[0].COUNT;
            if (count != 0) {
                // If find dumplicate primary keys in the database, return
                return callback({message: helper.USERNAME_HAS_BEEN_TAKEN, user: null});
            }
            const queryString2 = 'INSERT INTO users SET ?;';
            connection.query(queryString2, user, function(err, rows) {
                if (err) {
                    return callback({message: helper.FAIL, user: null});
                }
                const queryString3 = 'SELECT * FROM users WHERE username=?;';
                connection.query(queryString3, user.username, function(err, rows) {
                    // console.log(err);
                    if (err) {
                        return callback({message: helper.FAIL, user: null});
                    }
                    return callback({message: helper.SUCCESS, user: rows[0]});
                });
            });
        });
    },




    changeInfo : function (connection, inputUser, originalUser, callback) {
        const password = connection.escape(inputUser.password);
        const newPassword = connection.escape(inputUser.newPassword);
        const confirmPassword = connection.escape(inputUser.confirmPassword);
        const username = connection.escape(originalUser.username);
        console.log(username);
        if (newPassword != confirmPassword) {
            return callback({message: helper.TWO_PASSWORDS_DOESNT_MATCH, user: originalUser});
        }
        this.login(connection, originalUser.username, inputUser.password, function(result) {
            console.log(result);
            if (result.message != helper.SUCCESS) {
                return callback({message: helper.WRONG_PASSWORD, user: originalUser});
            }
            // If the password is correct, then update the user's info
            const user = {
                'firstname':        connection.escape(helper.toLowerCase(inputUser.firstname)),
                'lastname':         connection.escape(helper.toLowerCase(inputUser.lastname)),
                'password':         connection.escape(newPassword),
                'address':          connection.escape(helper.toLowerCase(inputUser.address)),
                'zip':              connection.escape(helper.toLowerCase(inputUser.zip)),
                'city':             connection.escape(helper.toLowerCase(inputUser.city)),
                'state':            connection.escape(helper.toLowerCase(inputUser.state)),
                'country':          connection.escape(helper.toLowerCase(inputUser.country))
            };
            const queryString2 = 'UPDATE users SET ? WHERE username=?;';
            connection.query(queryString2, [user, username], function(err, rows) {
                if (err) {
                    return callback({message: helper.FAIL, user: originalUser});
                }
                const queryString3 = 'SELECT * FROM users WHERE username=?;';
                connection.query(queryString3, username, function(err, rows) {
                    // console.log(err);
                    if (err) {
                        return callback({message: helper.FAIL, user: originalUser});
                    }
                    return callback({message: helper.SUCCESS, user: stripUser(rows[0])});
                });
            });
        });
    }
};


function stripUser (user) {
    user.username = helper.stripString(user.username);
    user.firstname = helper.stripString(user.firstname);
    user.lastname = helper.stripString(user.lastname);
    user.address = helper.stripString(user.address);
    user.zip = helper.stripString(user.zip);
    user.city = helper.stripString(user.city);
    user.state = helper.stripString(user.state);
    user.country = helper.stripString(user.country);
    return user;
}
