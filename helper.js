const fs = require('fs');
var request = require('request');

module.exports = {
    // Message to be sent to browser
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
    DUPLICATE_PRIMARY_KEY: 'DUPLICATE_PRIMARY_KEY',
    MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
    ITEM_DOESNT_EXIST: 'ITEM_DOESNT_EXIST',
    INCORRECT_QUERY: 'INCORRECT_QUERY',
    INVALID_NUMBER_FORMAT: 'INVALID_NUMBER_FORMAT',
    SCHEDULE_CONFLITS: 'SCHEDULE_CONFLITS',
    DELETE_TOO_MANY_ITEMS: 'DELETE_TOO_MANY_ITEMS',
    USER_DOESNT_EXISTS: 'USER_DOESNT_EXISTS',
    WRONG_PASSWORD: 'WRONG_PASSWORD',
    USERNAME_HAS_BEEN_TAKEN: 'USERNAME_HAS_BEEN_TAKEN',
    MACHINE_IS_SLEEPING_NOW: 'MACHINE_IS_SLEEPING_NOW',
    MACHINE_IS_WORKING_NOW: 'MACHINE_IS_WORKING_NOW',
    MISSING_FIELDS_OF_USER_ADDRESS: 'MISSING_FIELDS_OF_USER_ADDRESS',
    TWO_PASSWORDS_DOESNT_MATCH: 'TWO_PASSWORDS_DOESNT_MATCH',
    NO_GOOGLE_MAP_API_KEY_FOUND: 'NO_GOOGLE_MAP_API_KEY_FOUND',
    ZERO_RESULTS: 'ZERO_RESULTS',
    // If the string is not null, then change it to lowercase
    toLowerCase : function (s) {
        if (s) {
            return s.toLowerCase();
        }
        return s;
    },

    stripString : function (s) {
        if (s) {
            if (s.length >= 2 && s.charAt(0) == "'" && s.charAt(s.length - 1) == "'") {
                return s.slice(1, s.length - 1);
            } else if (s.length < 2) {
                return "";
            } else {
                return s;
            }
        }
        return s;
    },

    getGooglMapAPIKey : function (callback) {
        fs.readFile('GOOGLE_MAP_API_KEY.dat', 'utf8', function (err, data) {
          if (err) {
                callback(NO_GOOGLE_MAP_API_KEY_FOUND);
            } else {
                callback(data);
            }
        });
    },

    getLocation : function (GoogleMapAPIKey, address, city, callback) {
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + ', ' + city;
        url = url.replace(/ /g, '+');
        url += '&key=' + GoogleMapAPIKey;
        console.log(url);

        var req = request.get({url: url, json: true}, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body['status'] == 'ZERO_RESULTS') {
                    callback({message: 'ZERO_RESULTS'});
                } else {
                    const latitude = body['results'][0]['geometry']['location']['lat'];
                    const longitude = body['results'][0]['geometry']['location']['lng'];
                    callback({message: 'SUCCESS', latitude: latitude, longitude: longitude});
                }
            } else {
                callback({message: 'FAIL'});
            }
        });
    }
}
