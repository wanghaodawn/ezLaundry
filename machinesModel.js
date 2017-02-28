const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const moment = require('moment');

const helper = require('./helper.js');

module.exports = {
    createMachine : function (GoogleMapAPIKey, connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // If any of the required fields is missing, then return
        if (!query.machine_id || !query.idle_power || !query.running_time_minute || !query.machine_type) {
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // Check if the input numbers are in good format
        if (isNaN(query.machine_id) || isNaN(query.running_time_minute)
            || (isNaN(query.idle_power) && query.idle_power.toString.indexOf('.' != -1))) {
            return callback(helper.INVALID_NUMBER_FORMAT);
        }
        // Use escape to prevent from SQL Injection
        var machine = {
            'machine_id':           query.machine_id,
            'idle_power':           query.idle_power,
            'running_time_minute':  query.running_time_minute,
            'machine_type':         connection.escape(helper.toLowerCase(query.machine_type))
        };
        // console.log(machine);
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM machines WHERE machine_id=?;';
        connection.query(queryString1, machine.machine_id, function(err, rows) {
            if (err) {
                return callback(helper.FAIL);
            }
            var count = rows[0].COUNT;
            if (count != 0) {
                // If find dumplicate primary keys in the database, return
                return callback(helper.DUPLICATE_PRIMARY_KEY);
            }
            var res_message = '';
            if ('address' in query && 'city' in query ) {
                // Use escape to prevent from SQL Injection
                const address = helper.toLowerCase(query.address);
                const city = helper.toLowerCase(query.city);

                // Get user's desired apartment's latitude and longitude
                helper.getLocation(GoogleMapAPIKey, address, city, function(res) {
                    res_message = res.message;
                    if (res.message == helper.SUCCESS) {
                        machine['latitude'] = res.latitude;
                        machine['longitude'] = res.longitude;
                    }
                    const queryString2 = 'INSERT INTO machines SET ?;';
                    connection.query(queryString2, machine, function(err, rows) {
                        if (err) {
                            // Fail, return
                            return callback(helper.FAIL);
                        }
                        // Success
                        return callback(helper.SUCCESS);
                    });
                });
            } else {
                const queryString2 = 'INSERT INTO machines SET ?;';
                connection.query(queryString2, machine, function(err, rows) {
                    if (err) {
                        // Fail, return
                        return callback(helper.FAIL);
                    }
                    // Success
                    return callback(helper.SUCCESS);
                });
            }
        });
    },



    deleteOneMachine : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // Use escape to prevent from SQL Injection
        const machine = {
            'machine_id': query.machine_id
        };
        // console.log(machine);
        if (query.machine_id) {
            // Check if the input numbers are in good format
            if (isNaN(query.machine_id)) {
                return callback(helper.INVALID_NUMBER_FORMAT);
            }
            // Delete one machine
            const queryString1 = 'SELECT COUNT(*) AS COUNT FROM machines WHERE machine_id=?;';
            connection.query(queryString1, machine.machine_id, function(err, rows) {
                if (err) {
                    return callback(helper.FAIL);
                }
                var count = rows[0].COUNT;
                if (count != 1) {
                    // If cannot find the item,then return
                    return callback(helper.ITEM_DOESNT_EXIST);
                }
                const queryString2 = 'DELETE FROM machines WHERE machine_id=?;';
                connection.query(queryString2, machine.machine_id, function(err, rows) {
                    if (err) {
                        // Fail, return
                        return callback(helper.FAIL);
                    }
                    // Success
                    return callback(helper.SUCCESS);
                });
            });
        } else {
            // If any of the required fields is missing, then return
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
    },


    deleteAllMachines : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
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
                    return callback(helper.FAIL);
                }
                // Success
                return callback(helper.SUCCESS);
            });
        } else {
            // If any of the required fields is missing, then return
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
    },



    // Show all machines
    showAllMachines : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
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
                    return callback(helper.FAIL);
                }
                // Success
                result = helper.normalizeMachines(rows);
                return callback(result);
            });
        } else {
            // If any of the required fields is missing, then return
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
    }
};
