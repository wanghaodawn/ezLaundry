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
    // If the string is not null, then change it to lowercase
    toLowerCase : function (s) {
        if (s) {
            return s.toLowerCase();
        }
        return s;
    }
}
