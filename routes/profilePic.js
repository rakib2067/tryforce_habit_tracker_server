//Requires
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users')

router.get('/', usersController.getProfilePics);
router.get('/:id', usersController.getProfilePicsById);

module.exports = router;