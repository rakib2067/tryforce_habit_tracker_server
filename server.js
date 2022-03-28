//Requires
const express = require('express');
const cors = require('cors');

//Server setup
const server = express();
server.use(cors());
server.use(express.json());

//Routes setup
const usersRoutes = require('./routes/users')
const habitsRoutes = require('./routes/habits')
const authRoutes = require('./routes/auth')
server.use('/users', usersRoutes)
server.use('/habits', habitsRoutes)
server.use('/auth', authRoutes)

//Base dir
server.get('/', (req, res) => res.send('Tryforce Tracker API - by Rakib, Andrew and Zeia'))

//export
module.exports = server