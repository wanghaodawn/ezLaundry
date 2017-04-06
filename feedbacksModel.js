const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const moment = require('moment');

const helper = require('./helper.js');

module.exports = {
    addFeedback : function(connection, query, res, callback) {
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
        if (!query.text) {
            return callback({message: helper.MISSING_REPORT_BODY, email: null});
        }

        const data = {
            username: connection.escape(helper.toLowerCase(query.username)),
            text: connection.escape(query.text),
            timestamp: moment(new Date()).tz("America/New_York").format('YYYY-MM-DD HH:mm:ss')
        }

        console.log(data);

        const queryString1 = 'INSERT INTO feedbacks SET ?;';
        connection.query(queryString1, data, function(err, rows) {
            if (err) {
                console.log(err);
                return callback({message: helper.FAIL, email: null});
            }

            const queryString2 = 'SELECT email FROM users WHERE username = ?;';
            connection.query(queryString2, data.username, function(err, rows) {
                if (err) {
                    console.log(err);
                    return callback({message: helper.FAIL, email: null});
                }

                return callback({message: helper.SUCCESS, email: rows[0].email});
            });
        });
    }
}
