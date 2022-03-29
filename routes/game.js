//Requires
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game');
const authController = require('../controllers/auth');

router.get('/levels', gameController.getLevels);
router.get('/levels/:id', gameController.getLevelById);

module.exports = router;