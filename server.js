//Requires
const express = require('express');
const cors = require('cors');

//Task scheduling
const cron = require('node-cron');
const shell = require('shelljs');
const taskScheduler = require('./taskScheduler');

cron.schedule("00 50 23 * * *", async function () {console.log("Scheduler tick: Time is: " + new Date().toLocaleString()); taskScheduler.go();})
cron.schedule("00 55 23 * * * *", async function () {console.log("Email tick: Time is: " + new Date().toLocaleString()); taskScheduler.sendEmails();})
// cron.schedule("*/2 * * * *", async function () {console.log("Scheduler tick: Time is: " + new Date().toLocaleString()); taskScheduler.go();})
// cron.schedule("13 */2 * * * *", async function () {console.log("Email tick: Time is: " + new Date().toLocaleString()); taskScheduler.sendEmails();})

//Server setup
const server = express();
server.use(cors({origin:'*',credentials: true}));
server.use(express.json());

//Routes setup
const usersRoutes = require('./routes/users');
const habitsRoutes = require('./routes/habits');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const profilePicRoutes = require('./routes/profilePic');
server.use('/users', usersRoutes);
server.use('/habits', habitsRoutes);
server.use('/auth', authRoutes);
server.use('/game',gameRoutes);
server.use('/pfp',profilePicRoutes);

//Base dir
server.get('/', (req, res) => res.send('Tryforce Tracker API - by Rakib, Andrew and Zeia'))

//export
module.exports = server
