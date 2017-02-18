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
    }
}
