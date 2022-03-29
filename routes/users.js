//Requires
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users')

//Paths
router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.put('/:id',usersController.update);
router.delete('/:id',usersController.destroy);

router.get('/:id/habits', usersController.getHabitsByUserId);
router.get('/:id/xptarget', usersController.getXpTarget);


//Export
module.exports = router;