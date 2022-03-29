//Requires
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game');

router.get('/levels', gameController.getLevels);
router.get('/levels/:id', gameController.getLevelById);

module.exports = router;