const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const moment = require('moment');

const helper = require('./helper.js');

module.exports = {
    createUser : function (connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            // Fail, return
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
            // If any of the required fields is missing, then return
            if (!query.username || !query.password) {
                callback(helper.MISSING_REQUIRED_FIELDS);
            }
            // Use escape to prevent from SQL Injection
            const user = {
                'username':     connection.escape(helper.toLowerCase(query.username)),
                'firstname':    connection.escape(helper.toLowerCase(query.firstname)),
                'lastname':     connection.escape(helper.toLowerCase(query.lastname)),
                'password':     connection.escape(query.password),
                'address':      connection.escape(helper.toLowerCase(query.address)),
                'zip':          connection.escape(helper.toLowerCase(query.zip)),
                'city':         connection.escape(helper.toLowerCase(query.city)),
                'state':        connection.escape(helper.toLowerCase(query.state)),
                'country':      connection.escape(helper.toLowerCase(query.country))
            };
            // console.log(user);
            const queryString1 = 'SELECT COUNT(*) AS COUNT FROM users WHERE username=?;';
            // console.log(queryString1);
            connection.query(queryString1, user.username, function(err, rows) {
                if (err) {
                    callback(helper.FAIL);
                } else {
                    var count = rows[0].COUNT;
                    if (count != 0) {
                        // If find dumplicate primary keys in the database, return
                        callback(helper.DUPLICATE_PRIMARY_KEY);
                    } else {
                        const queryString2 = 'INSERT INTO users SET ?;';
                        connection.query(queryString2, user, function(err, rows) {
                            if (err) {
                                callback(helper.FAIL);
                            } else {
                                callback(helper.SUCCESS);
                            }
                        });
                    }
                }
            });
        }
    },



    deleteOneUser : function(connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        console.log(query);
        if (JSON.stringify(query) == '{}') {
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
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
                        callback(helper.FAIL);
                    } else {
                        var count = rows[0].COUNT;
                        if (count != 1) {
                            // If cannot find the item,then return
                            callback(helper.ITEM_DOESNT_EXIST);
                        } else {
                            const queryString2 = 'DELETE FROM users WHERE username=?;';
                            connection.query(queryString2, user.username, function(err, rows) {
                                if (err) {
                                    // Fail, return
                                    callback(helper.FAIL);
                                } else {
                                    // Success
                                    callback(helper.SUCCESS);
                                }
                            });
                        }
                    }
                });
            } else {
                // If any of the required fields is missing, then return
                callback(helper.MISSING_REQUIRED_FIELDS);
            }
        }
    },



    deleteAllUsers : function(connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        console.log(query);
        if (JSON.stringify(query) == '{}') {
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
            // Use escape to prevent from SQL Injection
            const user = {
                'delete_all':   connection.escape(helper.toLowerCase(query.delete_all))
            };
            // console.log(user);
            if (query.delete_all && query.delete_all.toLowerCase() == 'true') {
                // Delete all users
                const queryString = 'DELETE FROM users;';
                connection.query(queryString, function(err, rows) {
                    if (err) {
                        // Fail, return
                        callback(helper.FAIL);
                    } else {
                        // Success
                        callback(helper.SUCCESS);
                    }
                });
            } else {
                // If any of the required fields is missing, then return
                callback(helper.MISSING_REQUIRED_FIELDS);
            }
        }
    },



    // Show all users
    showAllUsers : function (connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
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
                        callback(helper.FAIL);
                    } else {
                        // Success
                        callback(JSON.stringify(rows));
                    }
                });
            } else {
                // If any of the required fields is missing, then return
                callback(helper.MISSING_REQUIRED_FIELDS);
            }
        }
    }
};
