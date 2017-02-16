const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const url = require('url');
const mysql = require('mysql');
const moment = require('moment');

const usersModel = require('./usersModel.js');
const machinesModel = require('./machinesModel.js');
const schedulesAnnonymousModel = require('./schedulesAnnonymousModel.js');
const schedules = require('./schedulesModel.js');
const helper = require('./helper.js');

var app = express();
const port = 3000;

// Configurate the connection to MySQL
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'laundry_helper'
});
connection.connect();

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


// RESTful APIs
// Create a user
app.get('/api/add_user?', (req, res) => {
    usersModel.createUser(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Delte one user
app.get('/api/delete_one_user?', (req, res) => {
    usersModel.deleteOneUser(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Delete all users
app.get('/api/delete_all_users?', (req, res) => {
    usersModel.deleteAllUsers(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Show all users
app.get('/api/show_all_users?', (req, res) => {
    usersModel.showAllUsers(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Create a machine
app.get('/api/add_machine?', (req, res) => {
    machinesModel.createMachine(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Delete one machine
app.get('/api/delete_one_machine?', (req, res) => {
    machinesModel.deleteOneMachine(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Delete all machines
app.get('/api/delete_all_machines?', (req, res) => {
    machinesModel.deleteAllMachines(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Show all machines
app.get('/api/show_all_machines?', (req, res) => {
    machinesModel.showAllMachines(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Create a schedule_annonymous
app.get('/api/add_schedule_anonymous?', (req, res) => {
    schedulesAnnonymousModel.createSchedule(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Delete first n schedules annonymous
app.get('/api/delete_first_n_schedule_anonymous?', (req, res) => {
    schedulesAnnonymousModel.deleteFirstNScheduleMachine(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Delete last n schedules annonymous
app.get('/api/delete_last_n_schedule_anonymous?', (req, res) => {
    schedulesAnnonymousModel.deleteLastNScheduleMachine(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Delete all schedules annonymous of a machine
app.get('/api/delete_machine_schedule_anonymous?', (req, res) => {
    schedulesAnnonymousModel.deleteSchedulesMachine(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Delete all schedules annonymous
app.get('/api/delete_all_schedule_anonymous?', (req, res) => {
    schedulesAnnonymousModel.deleteAllSchedules(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Show all schedules annonymous of a machine
app.get('/api/show_all_schedule_anonymous?', (req, res) => {
    schedulesAnnonymousModel.showAllSchedules(connection, req, res, function(result) {
        res.render('result.hbs', {
            result: result
        });
    });
});

// Start the server
app.listen(port);
console.log(`Starting server at localhost:${port}`);
