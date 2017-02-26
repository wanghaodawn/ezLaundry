const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const moment = require('moment');

const helper = require('./helper.js');

module.exports = {
    createMachine : function (connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
            // If any of the required fields is missing, then return
            if (!query.machine_id || !query.idle_power || !query.running_time_minute || !query.machine_type) {
                callback(helper.MISSING_REQUIRED_FIELDS);
            }
            // Check if the input numbers are in good format
            if (isNaN(query.machine_id) || isNaN(query.running_time_minute)
                || (isNaN(query.idle_power) && query.idle_power.toString.indexOf('.' != -1))) {
                callback(helper.INVALID_NUMBER_FORMAT);
            }
            // Use escape to prevent from SQL Injection
            const machine = {
                'machine_id':           query.machine_id,
                'idle_power':           query.idle_power,
                'running_time_minute':  query.running_time_minute,
                'machine_type':         connection.escape(helper.toLowerCase(query.machine_type)),
                'address':              connection.escape(helper.toLowerCase(query.address)),
                'zip':                  connection.escape(helper.toLowerCase(query.zip)),
                'city':                 connection.escape(helper.toLowerCase(query.city)),
                'state':                connection.escape(helper.toLowerCase(query.state)),
                'country':              connection.escape(helper.toLowerCase(query.country))
            };
            console.log(machine);
            const queryString1 = 'SELECT COUNT(*) AS COUNT FROM machines WHERE machine_id=?;';
            connection.query(queryString1, machine.machine_id, function(err, rows) {
                if (err) {
                    callback(helper.FAIL);
                } else {
                    var count = rows[0].COUNT;
                    if (count != 0) {
                        // If find dumplicate primary keys in the database, return
                        callback(helper.DUPLICATE_PRIMARY_KEY);
                    } else {
                        const queryString2 = 'INSERT INTO machines SET ?;';
                        connection.query(queryString2, machine, function(err, rows) {
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
        }
    },



    deleteOneMachine : function (connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
            // Use escape to prevent from SQL Injection
            const machine = {
                'machine_id': query.machine_id
            };
            // console.log(machine);
            if (query.machine_id) {
                // Check if the input numbers are in good format
                if (isNaN(query.machine_id)) {
                    callback(helper.INVALID_NUMBER_FORMAT);
                }
                // Delete one machine
                const queryString1 = 'SELECT COUNT(*) AS COUNT FROM machines WHERE machine_id=?;';
                connection.query(queryString1, machine.machine_id, function(err, rows) {
                    if (err) {
                        callback(helper.FAIL);
                    } else {
                        var count = rows[0].COUNT;
                        if (count != 1) {
                            // If cannot find the item,then return
                            callback(helper.ITEM_DOESNT_EXIST);
                        } else {
                            const queryString2 = 'DELETE FROM machines WHERE machine_id=?;';
                            connection.query(queryString2, machine.machine_id, function(err, rows) {
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


    deleteAllMachines : function (connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
            // Use escape to prevent from SQL Injection
            const machine = {
                'delete_all': connection.escape(helper.toLowerCase(query.delete_all))
            };
            // console.log(machine);
            if (query.delete_all && query.delete_all.toLowerCase() == 'true') {
                // Delete all machines
                const queryString = 'DELETE FROM machines;';
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



    // Show all machines
    showAllMachines : function (connection, req, res, callback) {
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
                const queryString = 'SELECT * FROM machines;';
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
