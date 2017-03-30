const fs = require('fs');
var request = require('request');

module.exports = {
    // Message to be sent to browser
    SUCCESS: 'Success',
    FAIL: 'Database Failure',
    MISSING_USERNAME: 'Please enter your username',
    MISSING_PASSWORD: 'Please enter your password',
    MISSING_PROPERTY_NAME: 'Please enter the proptery name',
    MISSING_MACHINE_ID: 'Please enter machine_id',
    MISSING_CURR_POWER: 'Please enter the current power of the machine',
    DUPLICATE_PRIMARY_KEY: 'Duplicate Primary Key',
    MISSING_DELETE_ALL: 'Please enter delete_all in parameters',
    MISSING_SHOW_ALL: 'Please enter show_all in parameters',
    MISSING_REQUIRED_FIELDS: 'Missing required fields',
    MISSING_NUM_MACHINES: 'Missing number of machines',
    MISSING_MACHINE_TYPE: 'Missing machine type',
    MISSING_ADDRESS: 'Missing address',
    MISSING_CITY: 'Missing city',
    MISSING_EMAIL: 'Missing email',
    ITEM_DOESNT_EXIST: 'The requested item doesn\'t exist',
    INCORRECT_QUERY: 'Please enter the correct query',
    INVALID_NUMBER_FORMAT: 'Please enter the correct number format',
    SCHEDULE_CONFLITS: 'The schedule has just been created',
    DELETE_TOO_MANY_ITEMS: 'You cannot enter the number more than current number of items',
    USER_DOESNT_EXISTS: 'This user doesn\'t exist',
    WRONG_PASSWORD: 'The password is wrong',
    USERNAME_HAS_BEEN_TAKEN: 'This username has already been taken',
    MACHINE_IS_SLEEPING_NOW: 'The machine is sleeping now',
    MACHINE_IS_WORKING_NOW: 'The machine begins to work now',
    MISSING_FIELDS_OF_USER_ADDRESS: 'Please enter the user\'s address',
    TWO_PASSWORDS_DOESNT_MATCH: 'Two passwords doesn\'t mactch',
    NO_GOOGLE_MAP_API_KEY_FOUND: 'Cannot find the API Key of Google Map',
    ZERO_RESULTS: 'Zero results returned',
    MACHINE_DOESNT_EXIST: 'This machine doesn\'t exist',
    USER_CAN_ONLY_RESERVE_ONE_MACHINE_AT_THE_SAME_TIME: 'Every user can only reserve one machine at the same time',
    MACHINE_IS_NOT_AVAILABLE_AT_THAT_TIME: 'The selected machine is not available at that time',
    NO_MACHINE_THIS_ADDRESS: 'No machines are registered at this address',
    INVALID_ADDRESS: 'Please enter a valid address',
    THERE_IS_A_LANDLORD_IN_THIS_ADDRESS: 'There is a landlord in this address',
    NO_LANDLORDS_IN_THIS_ADDRESS: 'There are no landlords in this address',
    NO_EMAIL_PASSWORD_FOUND: 'Cannot find the email password in local file system',
    FAILED_SENDING_EMAIL: 'Failed to send the email to landlord',
    // If the string is not null, then change it to lowercase
    toLowerCase : function (s) {
        if (s) {
            return s.toLowerCase();
        }
        return s;
    },

    stripJSON : function (obj) {
        // console.log(obj);
        // return JSON.parse(JSON.stringify(obj).replace(/\\"/g, '').replace(/\'/g, ''));
        return JSON.parse(JSON.stringify(obj).replace(/\'/g, ''));
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
                return callback('Cannot find the API Key of Google Map');
            }
            return callback(data);
        });
    },

    getEmailPassword : function (callback) {
        fs.readFile('email-info.dat', 'utf8', function (err, data) {
          if (err) {
                return callback('Cannot find the email password');
            }
            return callback(data);
        });
    },

    getLocation : function (GoogleMapAPIKey, address, city, callback) {
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + ', ' + city;
        url = url.replace(/ /g, '+');
        url += '&key=' + GoogleMapAPIKey;
        console.log(url);

        var req = request.get({url: url, json: true}, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                // console.log(body['status']);
                if (body['status'] == 'ZERO_RESULTS') {
                    return callback({message: 'Please enter a valid address', latitude: null, longitude: null});
                }
                // console.log(body['results'][0]['geometry']['location']);
                const latitude = body['results'][0]['geometry']['location']['lat'];
                const longitude = body['results'][0]['geometry']['location']['lng'];
                return callback({message: 'Success', latitude: latitude, longitude: longitude});
            } else {
                return callback({message: 'Database Failure', latitude: null, longitude: null});
            }
        });
    },


    normalizeSchedulesAnn : function (rows) {
        var result = [];
        for (var i in rows) {
            var dic = {};
            dic.schedule_id = rows[i].schedule_id;
            dic.start_time = rows[i].start_time;
            dic.end_time = rows[i].end_time;
            dic.machine_id = rows[i].machine_id;
            result.push(dic);
        }
        return result;
    },


    normalizeSchedules : function (rows) {
        var result = [];
        for (var i in rows) {
            var dic = {};
            dic.schedule_id = rows[i].schedule_id;
            dic.start_time = rows[i].start_time;
            dic.end_time = rows[i].end_time;
            dic.machine_id = rows[i].machine_id;
            dic.username = rows[i].username;
            result.push(dic);
        }
        return result;
    },


    normalizeMachines : function (rows) {
        var result = [];
        for (var i in rows) {
            var dic = {};
            dic.machine_id = rows[i].machine_id;
            dic.idle_power = rows[i].idle_power;
            dic.running_time_minute = rows[i].running_time_minute;
            dic.landloard_id = rows[i].landloard_id;
            dic.machine_type = rows[i].machine_type;
            result.push(dic);
        }
        return result;
    },


    normalizeUsers : function (rows) {
        var result = [];
        for (var i in rows) {
            var dic = {};
            dic.username = rows[i].username;
            dic.password = rows[i].password;
            dic.landloard_id = rows[i].landloard_id;
            result.push(dic);
        }
        return result;
    },


    normalizeLandlords : function (rows) {
        var result = [];
        for (var i in rows) {
            var dic = {};
            dic.landloard_id = rows[i].landloard_id;
            dic.longitude = rows[i].longitude;
            dic.latitude = rows[i].latitude;
            dic.property_name = rows[i].property_name;
            dic.email = rows[i].email;
            result.push(dic);
        }
        return result;
    },


    normalizeUserLandlord : function (rows) {
        var result = [];
        for (var i in rows) {
            var dic = {};
            dic.username = rows[i].username;
            dic.property_name = rows[i].property_name;
            dic.password = rows[i].password;
            result.push(dic);
        }
        return result;
    }
}
