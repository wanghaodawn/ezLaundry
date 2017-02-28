const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const moment = require('moment-timezone');

const helper = require('./helper.js');

module.exports = {
    createSchedule : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // If any of the required fields is missing, then return
        if (!query.machine_id || !query.username) {
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // Check if the input numbers are in good format
        if (isNaN(query.machine_id)) {
            return callback(helper.INVALID_NUMBER_FORMAT);
        }
        // Get current time in the timezone of the server
        const start_date = new Date();
        const start_time = moment(start_date).tz("America/New_York").format('YYYY-MM-DD HH:mm:ss');
        const username = connection.escape(helper.toLowerCase(query.username));

        // console.log(query.machine_id);
        // Check whether the machine exists or not
        const queryString000 = 'SELECT COUNT(*) AS COUNT FROM machines WHERE machine_id=?;';
        connection.query(queryString000, query.machine_id, function(err, rows) {
            if (err) {
                // Fail, return
                return callback(helper.FAIL);
            }
            var count = rows[0].COUNT;
            if (count == 0) {
                // No such machines
                return callback(helper.ITEM_DOESNT_EXIST);
            }
            const queryString00 = 'SELECT COUNT(*) AS COUNT FROM users WHERE username=?;';
            connection.query(queryString00, username, function(err, rows) {
                if (err) {
                    // Fail, return
                    return callback(helper.FAIL);
                }
                var count = rows[0].COUNT;
                if (count == 0) {
                    // No such machines
                    return callback(helper.USER_DOESNT_EXISTS);
                }
                // Get running_time_minute of the machine
                const queryString0 = 'SELECT running_time_minute FROM machines WHERE machine_id=?;';
                connection.query(queryString0, query.machine_id, function(err, rows) {
                    if (err) {
                        // Fail, return
                        return callback(helper.FAIL);
                    }
                    // Success
                    // console.log(rows[0]);
                    var running_time_minute = rows[0].running_time_minute;
                    const end_date = start_date.setMinutes(start_date.getMinutes() + running_time_minute);
                    const end_time = moment(end_date).tz("America/New_York").format('YYYY-MM-DD HH:mm:ss');
                    // console.log(start_time);
                    // console.log(end_time);
                    // Use escape to prevent from SQL Injection
                    const schedules = {
                        username:   username,
                        machine_id: query.machine_id,
                        start_time: start_time,
                        end_time:   end_time
                    };

                    // console.log(schedules);
                    // Find all overlap shcedules for the machine
                    const queryString1 = 'SELECT COUNT(*) AS COUNT \
                                          FROM schedules\
                                          WHERE username =? AND machine_id =? AND \
                                          (\
                                              (start_time >=? AND start_time <=?) OR\
                                              (end_time >=? AND end_time <=?)\
                                          );';
                    connection.query(queryString1, [username, schedules.machine_id,
                        schedules.start_time, schedules.end_time,
                        schedules.start_time, schedules.end_time], function(err, rows) {
                        if (err) {
                            // console.log(err);
                            return callback(helper.FAIL);
                        }
                        var count = rows[0].COUNT;
                        if (count != 0) {
                            // If find dumplicate primary keys in the database, return
                            return callback(helper.SCHEDULE_CONFLITS);
                        }
                        const queryString2 = 'INSERT INTO schedules SET ?;';
                        connection.query(queryString2, schedules, function(err, rows) {
                            if (err) {
                                // Fail, return
                                return callback(helper.FAIL);
                            }
                            // Success
                            return callback(helper.SUCCESS);
                        });
                    });
                });
            });
        });
    },



    deleteFirstNScheduleMachine : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // If any of the required fields is missing, then return
        if (!query.machine_id || !query.n || !query.username) {
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // console.log(query);
        // Check if the input numbers are in good format
        if (isNaN(query.machine_id) || isNaN(query.n) || query.n <= 0) {
            return callback(helper.INVALID_NUMBER_FORMAT);
        }
        const username = connection.escape(helper.toLowerCase(query.username));
        // Check whether the machine exists or not
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM schedules WHERE username=? AND machine_id=?;';
        connection.query(queryString1, [username, query.machine_id], function(err, rows) {
            if (err) {
                // Fail, return
                return callback(helper.FAIL);
            }
            var count = rows[0].COUNT;
            if (count == 0) {
                // No such machines
                return callback(helper.ITEM_DOESNT_EXIST);
            } else if (count < query.n) {
                return callback(helper.DELETE_TOO_MANY_ITEMS);
            } else {
                const queryString2 = 'DELETE FROM schedules WHERE username=? AND machine_id=? ORDER BY start_time ASC LIMIT ' + query.n + ';'
                connection.query(queryString2, [username, query.machine_id], function(err, rows) {
                    if (err) {
                        // Fail, return
                        // console.log(err);
                        return callback(helper.FAIL);
                    }
                    // Success
                    return callback(helper.SUCCESS);
                });
            }
        });
    },



    deleteLastNScheduleMachine : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // If any of the required fields is missing, then return
        if (!query.machine_id || !query.n || !query.username) {
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // Check if the input numbers are in good format
        if (isNaN(query.machine_id) || isNaN(query.n) || query.n <= 0) {
            return callback(helper.INVALID_NUMBER_FORMAT);
        }
        const username = connection.escape(helper.toLowerCase(query.username));
        // Check whether the machine exists or not
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM schedules WHERE username=? AND machine_id=?;';
        connection.query(queryString1, [username, query.machine_id], function(err, rows) {
            if (err) {
                // Fail, return
                return callback(helper.FAIL);
            }
            var count = rows[0].COUNT;
            if (count == 0) {
                // No such machines
                return callback(helper.ITEM_DOESNT_EXIST);
            } else if (count < query.n) {
                return callback(helper.DELETE_TOO_MANY_ITEMS);
            } else {
                const queryString2 = 'DELETE FROM schedules WHERE username=? AND machine_id=? ORDER BY start_time DESC LIMIT ' + query.n + ';'
                connection.query(queryString2, [username, query.machine_id], function(err, rows) {
                    if (err) {
                        // Fail, return
                        // console.log(err);
                        return callback(helper.FAIL);
                    }
                    // Success
                    return callback(helper.SUCCESS);
                });
            }
        });
    },



    deleteSchedulesMachine : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // If any of the required fields is missing, then return
        if (!query.machine_id) {
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // Check if the input numbers are in good format
        if (isNaN(query.machine_id)) {
            return callback(helper.INVALID_NUMBER_FORMAT);
        }
        // Check whether the machine exists or not
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM schedules WHERE machine_id=?;';
        connection.query(queryString1, query.machine_id, function(err, rows) {
            if (err) {
                // Fail, return
                return callback(helper.FAIL);
            }
            var count = rows[0].COUNT;
            if (count == 0) {
                // No such machines
                return callback(helper.ITEM_DOESNT_EXIST);
            }
            const queryString2 = 'DELETE FROM schedules WHERE machine_id=?;'
            connection.query(queryString2, query.machine_id, function(err, rows) {
                if (err) {
                    // Fail, return
                    // console.log(err);
                    return callback(helper.FAIL);
                }
                // Success
                return callback(helper.SUCCESS);
            });
        });
    },



    deleteAllSchedules : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
        // Use escape to prevent from SQL Injection
        const schedule = {
            'delete_all': connection.escape(helper.toLowerCase(query.delete_all))
        };
        // console.log(machine);
        if (query.delete_all && query.delete_all.toLowerCase() == 'true') {
            // Delete all machines
            const queryString = 'DELETE FROM schedules;';
            connection.query(queryString, function(err, rows) {
                if (err) {
                    // Fail, return
                    return callback(helper.FAIL);
                } else {
                    // Success
                    return callback(helper.SUCCESS);
                }
            });
        } else {
            // If any of the required fields is missing, then return
            return callback(helper.MISSING_REQUIRED_FIELDS);
        }
   },



   showAllSchedules : function (connection, query, res, callback) {
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
           const queryString = 'SELECT * FROM schedules;';
           connection.query(queryString, function(err, rows) {
               if (err) {
                   // Fail, return
                   return callback(helper.FAIL);
               }// Success
               result = helper.normalizeSchedulesAnn(rows);
               return callback(result);
           });
       } else {
           // If any of the required fields is missing, then return
           return callback(helper.MISSING_REQUIRED_FIELDS);
       }
   }
}
