const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const moment = require('moment');

const helper = require('./helper.js');

module.exports = {
    createSchedule : function (connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
            // If any of the required fields is missing, then return
            if (!query.machine_id) {
                callback(helper.MISSING_REQUIRED_FIELDS);
            }
            // Check if the input numbers are in good format
            if (isNaN(query.machine_id)) {
                callback(helper.INVALID_NUMBER_FORMAT);
            }
            // Get current time in the timezone of the server
            const start_date = new Date();
            const start_time = moment(start_date).format('YYYY-MM-DD HH:mm:ss');

            // console.log(query.machine_id);
            // Check whether the machine exists or not
            const queryString00 = 'SELECT COUNT(*) AS COUNT FROM machines WHERE machine_id=?;';
            connection.query(queryString00, query.machine_id, function(err, rows) {
                if (err) {
                    // Fail, return
                    callback(helper.FAIL);
                } else {
                    var count = rows[0].COUNT;
                    if (count == 0) {
                        // No such machines
                        callback(helper.ITEM_DOESNT_EXIST);
                    } else {
                        // Get running_time_minute of the machine
                        const queryString0 = 'SELECT running_time_minute FROM machines WHERE machine_id=?;';
                        connection.query(queryString0, query.machine_id, function(err, rows) {
                            if (err) {
                                // Fail, return
                                callback(helper.FAIL);
                            } else {
                                // Success
                                console.log(rows[0]);
                                var running_time_minute = rows[0].running_time_minute;
                                const end_date = start_date.setMinutes(start_date.getMinutes() + running_time_minute);
                                const end_time = moment(end_date).format('YYYY-MM-DD HH:mm:ss');
                                // console.log(start_time);
                                // console.log(end_time);
                                // Use escape to prevent from SQL Injection
                                const schedules_annonymous = {
                                    'machine_id':   query.machine_id,
                                    'start_time':   start_time,
                                    'end_time':     end_time
                                };

                                console.log(schedules_annonymous);
                                // Find all overlap shcedules for the machine
                                const queryString1 = 'SELECT COUNT(*) AS COUNT \
                                                      FROM schedules_annonymous\
                                                      WHERE machine_id = ? AND (\
                                                          (start_time >= ? AND start_time <= ?) OR\
                                                          (end_time >= ? AND end_time <= ?)\
                                                      );';
                                connection.query(queryString1, [schedules_annonymous.machine_id,
                                    schedules_annonymous.start_time, schedules_annonymous.end_time,
                                    schedules_annonymous.start_time, schedules_annonymous.end_time], function(err, rows) {
                                    if (err) {
                                        callback(FAIL);
                                    } else {
                                        var count = rows[0].COUNT;
                                        if (count != 0) {
                                            // If find dumplicate primary keys in the database, return
                                            callback(helper.SCHEDULE_CONFLITS);
                                        } else {
                                            const queryString2 = 'INSERT INTO schedules_annonymous SET ?;';
                                            connection.query(queryString2, schedules_annonymous, function(err, rows) {
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
                        });
                    }
                }
            });
        }
    },



    deleteFirstNScheduleMachine : function (connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
            // If any of the required fields is missing, then return
            if (!query.machine_id || !query.n) {
                callback(helper.MISSING_REQUIRED_FIELDS);
            }
            // Check if the input numbers are in good format
            if (isNaN(query.machine_id) || isNaN(query.n) || query.n <= 0) {
                callback(helper.INVALID_NUMBER_FORMAT);
            }
            // Check whether the machine exists or not
            const queryString1 = 'SELECT COUNT(*) AS COUNT FROM schedules_annonymous WHERE machine_id=?;';
            connection.query(queryString1, query.machine_id, function(err, rows) {
                if (err) {
                    // Fail, return
                    callback(helper.FAIL);
                } else {
                    var count = rows[0].COUNT;
                    if (count == 0) {
                        // No such machines
                        callback(helper.ITEM_DOESNT_EXIST);
                    } else if (count < query.n) {
                        callback(helper.DELETE_TOO_MANY_ITEMS);
                    } else {
                        const queryString2 = 'DELETE FROM schedules_annonymous WHERE machine_id=? ORDER BY start_time ASC LIMIT ' + query.n + ';'
                        connection.query(queryString2, query.machine_id, function(err, rows) {
                            if (err) {
                                // Fail, return
                                // console.log(err);
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



    deleteLastNScheduleMachine : function (connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
            // If any of the required fields is missing, then return
            if (!query.machine_id || !query.n) {
                callback(helper.MISSING_REQUIRED_FIELDS);
            }
            // Check if the input numbers are in good format
            if (isNaN(query.machine_id) || isNaN(query.n) || query.n <= 0) {
                callback(helper.INVALID_NUMBER_FORMAT);
            }
            // Check whether the machine exists or not
            const queryString1 = 'SELECT COUNT(*) AS COUNT FROM schedules_annonymous WHERE machine_id=?;';
            connection.query(queryString1, query.machine_id, function(err, rows) {
                if (err) {
                    // Fail, return
                    callback(helper.FAIL);
                } else {
                    var count = rows[0].COUNT;
                    if (count == 0) {
                        // No such machines
                        callback(helper.ITEM_DOESNT_EXIST);
                    } else if (count < query.n) {
                        callback(helper.DELETE_TOO_MANY_ITEMS);
                    } else {
                        const queryString2 = 'DELETE FROM schedules_annonymous WHERE machine_id=? ORDER BY start_time DESC LIMIT ' + query.n + ';'
                        connection.query(queryString2, query.machine_id, function(err, rows) {
                            if (err) {
                                // Fail, return
                                // console.log(err);
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



    deleteSchedulesMachine : function (connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
            // If any of the required fields is missing, then return
            if (!query.machine_id) {
                callback(helper.MISSING_REQUIRED_FIELDS);
            }
            // Check if the input numbers are in good format
            if (isNaN(query.machine_id)) {
                callback(helper.INVALID_NUMBER_FORMAT);
            }
            // Check whether the machine exists or not
            const queryString1 = 'SELECT COUNT(*) AS COUNT FROM schedules_annonymous WHERE machine_id=?;';
            connection.query(queryString1, query.machine_id, function(err, rows) {
                if (err) {
                    // Fail, return
                    callback(helper.FAIL);
                } else {
                    var count = rows[0].COUNT;
                    if (count == 0) {
                        // No such machines
                        callback(helper.ITEM_DOESNT_EXIST);
                    } else {
                        const queryString2 = 'DELETE FROM schedules_annonymous WHERE machine_id=?;'
                        connection.query(queryString2, query.machine_id, function(err, rows) {
                            if (err) {
                                // Fail, return
                                // console.log(err);
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



    deleteAllSchedules : function (connection, req, res, callback) {
        var query = url.parse(req.url, true).query;
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            callback(helper.MISSING_REQUIRED_FIELDS);
        } else {
            // Use escape to prevent from SQL Injection
            const schedule = {
                'delete_all': connection.escape(helper.toLowerCase(query.delete_all))
            };
            // console.log(machine);
            if (query.delete_all && query.delete_all.toLowerCase() == 'true') {
                // Delete all machines
                const queryString = 'DELETE FROM schedules_annonymous;';
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



   showAllSchedules : function (connection, req, res, callback) {
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
               const queryString = 'SELECT * FROM schedules_annonymous;';
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
}