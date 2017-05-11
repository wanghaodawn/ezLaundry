const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const moment = require('moment');

const helper = require('./helper.js');

module.exports = {
    createLandlord : function (GoogleMapAPIKey, connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            // Fail, return
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
        // If any of the required fields is missing, then return
        if (!query.address) {
            return callback({message: helper.MISSING_ADDRESS});
        }
        if (!query.city) {
            return callback({message: helper.MISSING_CITY});
        }
        if (!query.property_name) {
            return callback({message: helper.MISSING_PROPERTY_NAME});
        }
        if (!query.email) {
            return callback({message: helper.MISSING_EMAIL});
        }

        var landlord = {
            'email':      connection.escape(helper.toLowerCase(query.email)),
            'property_name': connection.escape(query.property_name),
        };
        // Use escape to prevent from SQL Injection
        const address = helper.toLowerCase(query.address);
        const city = helper.toLowerCase(query.city);

        // Getthe landlord's latitude and longitude
        helper.getLocation(GoogleMapAPIKey, address, city, function(res) {
            // console.log(JSON.stringify(res));
            res_message = res.message;
            // console.log(res_message);
            // console.log(helper.SUCCESS);
            // console.log(res_message == helper.SUCCESS);
            if (res_message == helper.SUCCESS) {
                landlord['latitude'] = res.latitude;
                landlord['longitude'] = res.longitude;
            }

            console.log(landlord);

            // If the address is incorrect
            if (res.message == helper.INVALID_ADDRESS) {
                return callback({message: helper.INVALID_ADDRESS});
            }

            // Check whether the address has already has a landlord
            const queryString1 = 'SELECT COUNT(*) AS COUNT FROM landlords WHERE latitude=? AND longitude=?;';
            // console.log(queryString1);
            connection.query(queryString1, [landlord['latitude'], landlord['longitude']], function(err, rows) {
                if (err) {
                    console.log(err);
                    return callback({message: helper.FAIL});
                }
                var count = rows[0].COUNT;

                if (count != 0) {
                    // If find dumplicate primary keys in the database, return
                    return callback({message: helper.THERE_IS_A_LANDLORD_IN_THIS_ADDRESS});
                }

                // If there are no landlords in this address, then insert
                const queryString2 = 'INSERT INTO landlords SET ?;';
                connection.query(queryString2, landlord, function(err, rows) {
                    if (err) {
                        console.log(err);
                        return callback({message: helper.FAIL});
                    }
                });
                return callback({message: helper.SUCCESS});
            });
        });
    },



    deleteOneLandlord : function (GoogleMapAPIKey, connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            // Fail, return
            return callback({message: helper.MISSING_REQUIRED_FIELDS});
        }
        // If any of the required fields is missing, then return
        if (!query.address) {
            return callback({message: helper.MISSING_ADDRESS});
        }
        if (!query.city) {
            return callback({message: helper.MISSING_CITY});
        }

        var landlord = {};
        // Use escape to prevent from SQL Injection
        const address = helper.toLowerCase(query.address);
        const city = helper.toLowerCase(query.city);

        // Getthe landlord's latitude and longitude
        helper.getLocation(GoogleMapAPIKey, address, city, function(res) {
            // console.log(JSON.stringify(res));
            res_message = res.message;
            // console.log(res_message);
            // console.log(helper.SUCCESS);
            // console.log(res_message == helper.SUCCESS);
            if (res_message == helper.SUCCESS) {
                landlord['latitude'] = res.latitude;
                landlord['longitude'] = res.longitude;
            }

            // If the address is incorrect
            if (res.message == helper.INVALID_ADDRESS) {
                return callback({message: helper.INVALID_ADDRESS});
            }

            // Check whether the address has already has a landlord
            const queryString1 = 'SELECT COUNT(*) AS COUNT FROM landlords WHERE latitude=? AND longitude=?;';
            // console.log(queryString1);
            connection.query(queryString1, [landlord['latitude'], landlord['longitude']], function(err, rows) {
                if (err) {
                    console.log(err);
                    return callback({message: helper.FAIL});
                }
                var count = rows[0].COUNT;
                if (count == 0) {
                    // If find dumplicate primary keys in the database, return
                    return callback({message: helper.NO_LANDLORDS_IN_THIS_ADDRESS});
                }

                // Check whether the address has already has a landlord
                const queryString2 = 'DELETE FROM landlords WHERE latitude=? AND longitude=?;';
                // console.log(queryString1);
                connection.query(queryString2, [landlord['latitude'], landlord['longitude']], function(err, rows) {
                    if (err) {
                        console.log(err);
                        return callback({message: helper.FAIL});
                    }
                });
                return callback({message: helper.SUCCESS});
            });
        });
    },


    sendEmailToLandlord : function (connection, query, res, callback) {
        // console.log(query);
        if (JSON.stringify(query) == '{}') {
            // console.log('null_query');
            // Fail, return
            return callback({message: helper.MISSING_REQUIRED_FIELDS, email: null});
        }
        // If any of the required fields is missing, then return
        if (!query.username) {
            return callback({message: helper.MISSING_USERNAME, email: null});
        }
        if (!query.report) {
            return callback({message: helper.MISSING_REPORT_BODY, email: null});
        }
        const username = connection.escape(helper.toLowerCase(query.username));

        // Check whether the address has already has a landlord
        const queryString1 = 'SELECT l.email, l.property_name FROM landlords l, users u \
                              WHERE u.username = ? AND l.landlord_id = u.landlord_id;';
        // console.log(queryString1);
        connection.query(queryString1, username, function(err, rows) {
            if (err) {
                console.log(err);
                return callback({message: helper.FAIL});
            }

            if (rows.length == 0) {
                // If find dumplicate primary keys in the database, return
                return callback({message: helper.NO_LANDLORDS_IN_THIS_ADDRESS});
            }

            const email = rows[0].email;
            const property_name = rows[0].property_name;
            return callback({message: helper.SUCCESS, email: email, property_name: property_name});
        });
    }
}
