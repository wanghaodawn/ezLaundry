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
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
        // If any of the required fields is missing, then return
        if (!query.machine_id) {
            return callback({message: helper.MISSING_MACHINE_ID});
        }
        if (!query.curr_power) {
            return callback({message: helper.MISSING_CURR_POWER});
        }
        // Check if the input numbers are in good format
        if (isNaN(query.machine_id) || (isNaN(query.curr_power))) {
            return callback({message: helper.INVALID_NUMBER_FORMAT});
        }
        // Get current time in the timezone of the server
        const start_date = new Date();
        const start_time = moment(start_date).tz("America/New_York").format('YYYY-MM-DD HH:mm:ss');

        // console.log(query.machine_id);
        // Check whether the machine exists or not
        const queryString00 = 'SELECT COUNT(*) AS COUNT FROM machines WHERE machine_id=?;';
        connection.query(queryString00, query.machine_id, function(err, rows) {
            if (err) {
                // Fail, return
                return callback({message: helper.FAIL});
            }
            var count = rows[0].COUNT;
            if (count == 0) {
                // No such machines
                return callback({message: helper.ITEM_DOESNT_EXIST});
            }
            // Get running_time_minute of the machine
            const queryString0 = 'SELECT idle_power, running_time_minute FROM machines WHERE machine_id=?;';
            connection.query(queryString0, query.machine_id, function(err, rows) {
                if (err) {
                    // Fail, return
                    return callback({message: helper.FAIL});
                }
                // Success
                console.log(rows[0]);
                var running_time_minute = rows[0].running_time_minute;
                var idle_power = rows[0].idle_power;
                if (query.curr_power < idle_power) {
                    // The machine is still sleeping, return
                    return callback({message: helper.MACHINE_IS_SLEEPING_NOW});
                }
                // The machine begins to work, add to calendar
                const end_date = start_date.setMinutes(start_date.getMinutes() + running_time_minute);
                const end_time = moment(end_date).tz("America/New_York").format('YYYY-MM-DD HH:mm:ss');
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
                        return callback({message: helper.FAIL});
                    }
                    var count = rows[0].COUNT;
                    if (count != 0) {
                        // If find dumplicate primary keys in the database, return
                        return callback({message: helper.SCHEDULE_CONFLITS});
                    }
                    const queryString2 = 'INSERT INTO schedules_annonymous SET ?;';
                    connection.query(queryString2, schedules_annonymous, function(err, rows) {
                        if (err) {
                            // Fail, return
                            return callback({message: helper.FAIL});
                        }
                        // Success
                        return callback({message: helper.SUCCESS});
                    });
                });
            });
        });
    },



    deleteFirstNScheduleMachine : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
        // If any of the required fields is missing, then return
        if (!query.machine_id) {
            return callback({message: helper.MISSING_MACHINE_ID});
        }
        if (!query.n) {
            return callback({message: helper.MISSING_NUM_MACHINES});
        }
        // Check if the input numbers are in good format
        if (isNaN(query.machine_id) || isNaN(query.n) || query.n <= 0) {
            return callback({message: helper.INVALID_NUMBER_FORMAT});
        }
        // Check whether the machine exists or not
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM schedules_annonymous WHERE machine_id=?;';
        connection.query(queryString1, query.machine_id, function(err, rows) {
            if (err) {
                // Fail, return
                return callback({message: helper.FAIL});
            }
            var count = rows[0].COUNT;
            if (count == 0) {
                // No such machines
                return callback({message: helper.ITEM_DOESNT_EXIST});
            } else if (count < query.n) {
                return callback({message: helper.DELETE_TOO_MANY_ITEMS});
            } else {
                const queryString2 = 'DELETE FROM schedules_annonymous WHERE machine_id=? ORDER BY start_time ASC LIMIT ' + query.n + ';'
                connection.query(queryString2, query.machine_id, function(err, rows) {
                    if (err) {
                        // Fail, return
                        return callback({message: helper.FAIL});
                    }
                    // Success
                    return callback({message: helper.SUCCESS});
                });
            }
        });
    },



    deleteLastNScheduleMachine : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
        // If any of the required fields is missing, then return
        if (!query.machine_id || !query.n) {
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
        // Check if the input numbers are in good format
        if (isNaN(query.machine_id) || isNaN(query.n) || query.n <= 0) {
            return callback({message: helper.INVALID_NUMBER_FORMAT});
        }
        // Check whether the machine exists or not
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM schedules_annonymous WHERE machine_id=?;';
        connection.query(queryString1, query.machine_id, function(err, rows) {
            if (err) {
                // Fail, return
                return callback({message: helper.FAIL});
            }
            var count = rows[0].COUNT;
            if (count == 0) {
                // No such machines
                return callback({message: helper.ITEM_DOESNT_EXIST});
            } else if (count < query.n) {
                return callback({message: helper.DELETE_TOO_MANY_ITEMS});
            } else {
                const queryString2 = 'DELETE FROM schedules_annonymous WHERE machine_id=? ORDER BY start_time DESC LIMIT ' + query.n + ';'
                connection.query(queryString2, query.machine_id, function(err, rows) {
                    if (err) {
                        // Fail, return
                        // console.log(err);
                        return callback({message: helper.FAIL});
                    }
                    // Success
                    return callback({message: helper.SUCCESS});
                });
            }
        });
    },



    deleteSchedulesMachine : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
        // If any of the required fields is missing, then return
        if (!query.machine_id) {
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
        // Check if the input numbers are in good format
        if (isNaN(query.machine_id)) {
            return callback({message: helper.INVALID_NUMBER_FORMAT});
        }
        // Check whether the machine exists or not
        const queryString1 = 'SELECT COUNT(*) AS COUNT FROM schedules_annonymous WHERE machine_id=?;';
        connection.query(queryString1, query.machine_id, function(err, rows) {
            if (err) {
                // Fail, return
                return callback({message: helper.FAIL});
            }
            var count = rows[0].COUNT;
            if (count == 0) {
                // No such machines
                return callback({message: helper.ITEM_DOESNT_EXIST});
            }
            const queryString2 = 'DELETE FROM schedules_annonymous WHERE machine_id=?;'
            connection.query(queryString2, query.machine_id, function(err, rows) {
                if (err) {
                    // Fail, return
                    // console.log(err);
                    return callback({message: helper.FAIL});
                }
                // Success
                return callback({message: helper.SUCCESS});
            });
        });
    },



    deleteAllSchedules : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
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


   showAllSchedules : function (connection, query, res, callback) {
       // console.log(query);
       if (JSON.stringify(query) == '{}') {
           // console.log('null_query');
           return callback({message: helper.MISSING_REQUIRED_FIELDS, schedules: null});
       }
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
                   return callback({message: helper.FAIL, schedules: null});
               }
               // Success
               result = helper.normalizeSchedulesAnn(rows);
               return callback({message: helper.SUCCESS, schedules: JSON.stringify(result)});
           });
       } else {
           // If any of the required fields is missing, then return
           return callback({message: helper.MISSING_SHOW_ALL, schedules: null});
       }
   },


   showAllSchedulesAnnUserType : function (connection, query, res, callback) {
       // console.log(query);
       if (JSON.stringify(query) == '{}') {
           // console.log('null_query');
           return callback({message: helper.MISSING_REQUIRED_FIELDS, schedules: null});
       }
       if (!query.username) {
           return callback({message: helper.MISSING_USERNAME, schedules: null});
       }
       if (!query.machine_type) {
           return callback({message: helper.MISSING_MACHINE_TYPE, schedules: null});
       }
       const username = connection.escape(helper.toLowerCase(query.username));
       const machine_type = connection.escape(helper.toLowerCase(query.machine_type));

    //    Get user's latitude and longitude
       const queryString0 = 'SELECT * FROM users WHERE username=?;';
       connection.query(queryString0, username, function(err, rows) {
        //    console.log(err);
           if (err) {
               return callback({message: helper.FAIL, schedules: null});
           }
           if (rows.length == 0) {
               return callback({message: helper.USER_DOESNT_EXISTS, schedules: null});
           }
           const latitude = rows[0].latitude;
           const longitude = rows[0].longitude;
           const now = moment(new Date()).tz("America/New_York").format('YYYY-MM-DD HH:mm:ss');
        //    console.log(latitude);
        //    console.log(longitude);
        //    console.log(now);
        //    console.log(machine_type);

        //    Get all schedules in this location
           const queryString1 = 'SELECT s.schedule_id, m.machine_id, s.start_time, s.end_time\
                                 FROM schedules_annonymous s RIGHT JOIN machines m ON s.machine_id = m.machine_id \
                                 WHERE \
                                    m.latitude = ? AND m.longitude = ? \
                                    AND m.machine_type = ? \
                                    AND ( \
                                        s.start_time IS NULL OR DATE(s.start_time) = DATE(?) OR DATE(s.end_time) = DATE(?) \
                                    ) \
                                 ORDER BY s.end_time DESC;';
           connection.query(queryString1, [latitude, longitude, machine_type, now, now], function(err, rows) {
            //    console.log(err);
            //    console.log(rows);
               if (err) {
                   return callback({message: helper.FAIL, schedules: null});
               }
               result = helper.normalizeSchedulesAnn(rows);

               return callback({message: helper.SUCCESS, schedules: result});
           });
       });
   },



   showAllSchedulesAnnUserTypeAfterNow : function (connection, query, res, callback) {
       // console.log(query);
       if (JSON.stringify(query) == '{}') {
           // console.log('null_query');
           return callback({message: helper.MISSING_REQUIRED_FIELDS, schedules: null});
       }
       if (!query.username) {
           return callback({message: helper.MISSING_USERNAME, schedules: null});
       }
       if (!query.machine_type) {
           return callback({message: helper.MISSING_MACHINE_TYPE, schedules: null});
       }
       const username = connection.escape(helper.toLowerCase(query.username));
       const machine_type = connection.escape(helper.toLowerCase(query.machine_type));

    //    Get user's latitude and longitude
       const queryString0 = 'SELECT u.username, u.landlord_id FROM users WHERE username=?;';
       connection.query(queryString0, username, function(err, rows) {
        //    console.log(err);
           if (err) {
               return callback({message: helper.FAIL, schedules: null});
           }
           if (rows.length == 0) {
               return callback({message: helper.USER_DOESNT_EXISTS, schedules: null});
           }

           const landlord_id = rows[0].landlord_id;

           const now = moment(new Date()).tz("America/New_York").format('YYYY-MM-DD HH:mm:ss');
        //    console.log(latitude);
        //    console.log(longitude);
        //    console.log(now);
        //    console.log(machine_type);

        //    Get all schedules in this location
           const queryString1 = 'SELECT s.schedule_id, m.machine_id, s.start_time, s.end_time \
                                 FROM schedules_annonymous s RIGHT JOIN machines m ON s.machine_id = m.machine_id \
                                 WHERE \
                                    m.landlord_id = ? \
                                    AND m.machine_type = ? \
                                    AND ( \
                                        s.start_time IS NULL OR DATE(s.start_time) = DATE(NOW()) OR DATE(s.end_time) = DATE(NOW()) \
                                    ) \
                                 ORDER BY s.end_time;';
           connection.query(queryString1, [landlord_id, machine_type], function(err, rows) {
            //    console.log(err);
            //    console.log(rows);
               if (err) {
                   return callback({message: helper.FAIL, schedules: null});
               }
               result = helper.normalizeSchedulesAnn(rows);

               return callback({message: helper.SUCCESS, schedules: result});
           });
       });
   }
}
