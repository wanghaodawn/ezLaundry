const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const mysql = require('mysql');
const moment = require('moment-timezone');
const session = require('client-sessions');
const bodyParser = require('body-parser');
const https = require('https');

const usersModel = require('./usersModel.js');
const machinesModel = require('./machinesModel.js');
const schedulesAnnonymousModel = require('./schedulesAnnonymousModel.js');
const schedulesModel = require('./schedulesModel.js');
const helper = require('./helper.js');
const dashboard = require('./dashboard.js');

var app = express();
const port = 3000;

process.env.TZ = 'EST'

// Configurate the connection to MySQL
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'laundry_helper'
});
connection.connect();

// Get API Key for Google Map
var GoogleMapAPIKey = '';
helper.getGooglMapAPIKey(function (result) {
    GoogleMapAPIKey = result;
    if (GoogleMapAPIKey == '') {
        console.log(helper.NO_GOOGLE_MAP_API_KEY_FOUND);
    } else {
        console.log("Found Google MAP API KEY");
    }
});

// Configuration
hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

// Middleware - Generate logs of the server
app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;

  console.log(log);
  fs.appendFile('server.log', log + '\n', (err) => {
    if (err) {
      console.log('Unable to append to file system');
    }
  });
  next();
});

// Configuration of session
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

// Set body parser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Web Server
// Dashboard
app.get('/', (req, res) => {
    const user = req.session.user;
    console.log(JSON.stringify(req.session.user));
    if (!user) {
        res.redirect('/login');
    } else {
        dashboard.showDashboard(connection, user, function(result) {
            // console.log(result.schedules);
            res.render('dashboard.hbs', {
                user: JSON.stringify(user, undefined, 2),
                schedules: JSON.stringify(result.schedules)
            });
        })
    }
});

// test
app.get('/testapi/test.json', (req, res) => {
    var test = {
        name: 'Hao Wang'
    }
    res.send(test);
});

// Login page
app.get('/login', (req, res) => {
    const user = req.session.user;
    // console.log(JSON.stringify(req.session.user));
    if (!user) {
        res.render('login.hbs', {});
    } else {
        res.redirect('/');
    }
});

// Login action
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    usersModel.login(connection, username, password, function(result) {
        console.log(result);
        if (!result.user) {
            res.render('login.hbs', {
                message: result.message
            });
        } else {
            req.session.user = result.user;
            res.redirect('/');
        }
    });
});

// Register page
app.get('/register', (req, res) => {
    const user = req.session.user;
    console.log(JSON.stringify(req.session.user));
    if (!user) {
        res.render('register.hbs', {});
    } else {
        redirect('/');
    }
});

// Register action
app.post('/register', (req, res) => {
    const inputUser = {
        username:   req.body.username,
        password:   req.body.password,
        firstname:  req.body.firstname,
        lastname:   req.body.lastname,
        address:    req.body.address,
        zip:        req.body.zip,
        city:       req.body.city,
        state:      req.body.state,
        country:    req.body.country,
    };
    usersModel.register(connection, inputUser, function(result) {
        console.log(result);
        if (!result.user) {
            res.render('register.hbs', {
                message: result.message
            });
        } else {
            req.session.user = result.user;
            res.redirect('/');
        }
    });
});

// Change address
app.get('/change_info', (req, res) => {
    const user = req.session.user;
    console.log(JSON.stringify(req.session.user));
    if (!user) {
        res.render('login.hbs', {});
    } else {
        res.render('changeInfo.hbs', {
            user: req.session.user
        });
    }
});

app.post('/change_info', (req, res) => {
    const inputUser = {
        username:           req.session.user.username,
        password:           req.body.password,
        newPassword:        req.body.newPassword,
        confirmPassword:    req.body.confirmPassword,
        firstname:          req.body.firstname,
        lastname:           req.body.lastname,
        address:            req.body.address,
        zip:                req.body.zip,
        city:               req.body.city,
        state:              req.body.state,
        country:            req.body.country,
    };
    usersModel.changeInfo(connection, inputUser, req.session.user, function(result) {
        console.log(result);
        if (result.message != helper.SUCCESS) {
            res.render('changeInfo.hbs', {
                message: result.message,
                user: req.session.user,
            });
        } else {
            req.session.user = result.user;
            res.redirect('/');
        }
    });
});

// logout action
app.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
});


// RESTful APIs
// Create a user
app.post('/api/add_user/', (req, res) => {
    usersModel.createUser(GoogleMapAPIKey, connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Login a user
app.post('/api/login_user/', (req, res) => {
    usersModel.loginUser(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delte one user
app.post('/api/delete_one_user/', (req, res) => {
    usersModel.deleteOneUser(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete all users
app.post('/api/delete_all_users/', (req, res) => {
    usersModel.deleteAllUsers(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Show all users
app.post('/api/show_all_users/', (req, res) => {
    usersModel.showAllUsers(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        // console.log(output);
        res.send(output);
    });
});

// Create a machine
app.post('/api/add_machine/', (req, res) => {
    machinesModel.createMachine(GoogleMapAPIKey, connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete one machine
app.post('/api/delete_one_machine/', (req, res) => {
    machinesModel.deleteOneMachine(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete all machines
app.post('/api/delete_all_machines/', (req, res) => {
    machinesModel.deleteAllMachines(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Show all machines
app.post('/api/show_all_machines/', (req, res) => {
    machinesModel.showAllMachines(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Create a schedule_annonymous
app.post('/api/add_schedule/', (req, res) => {
    schedulesModel.createSchedule(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete first n schedules annonymous
app.post('/api/delete_first_n_schedule/', (req, res) => {
    schedulesModel.deleteFirstNScheduleMachine(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete last n schedules annonymous
app.post('/api/delete_last_n_schedule/', (req, res) => {
    schedulesModel.deleteLastNScheduleMachine(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete all schedules annonymous of a machine
app.post('/api/delete_machine_schedule/', (req, res) => {
    schedulesModel.deleteSchedulesMachine(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete all schedules annonymous
app.post('/api/delete_all_schedule/', (req, res) => {
    schedulesModel.deleteAllSchedules(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Show all schedules annonymous of a machine
app.post('/api/show_all_schedule/', (req, res) => {
    schedulesModel.showAllSchedules(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Create a schedule_annonymous
app.post('/api/add_schedule_anonymous/', (req, res) => {
    schedulesAnnonymousModel.createSchedule(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete first n schedules annonymous
app.post('/api/delete_first_n_schedule_anonymous/', (req, res) => {
    schedulesAnnonymousModel.deleteFirstNScheduleMachine(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete last n schedules annonymous
app.post('/api/delete_last_n_schedule_anonymous/', (req, res) => {
    schedulesAnnonymousModel.deleteLastNScheduleMachine(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete all schedules annonymous of a machine
app.post('/api/delete_machine_schedule_anonymous/', (req, res) => {
    schedulesAnnonymousModel.deleteSchedulesMachine(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Delete all schedules annonymous
app.post('/api/delete_all_schedule_anonymous/', (req, res) => {
    schedulesAnnonymousModel.deleteAllSchedules(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Show all schedules annonymous of a machine
app.post('/api/show_all_schedule_anonymous/', (req, res) => {
    schedulesAnnonymousModel.showAllSchedules(connection, req.body, res, function(result) {
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Show all schedules annonymous of the user's location and type
app.post('/api/show_user_schedule_anonymous_type/', (req, res) => {
    schedulesAnnonymousModel.showAllSchedulesUserType(connection, req.body, res, function(result) {
        console.log(result);
        var output = JSON.stringify(helper.stripJSON(result));
        res.send(output);
    });
});

// Start the server
app.listen(port);
console.log(`Starting server at localhost:${port}`);
