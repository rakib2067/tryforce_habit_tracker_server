//Requires
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users')

//Paths
router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.get('/:id/habits', usersController.getHabitsByUserId);
router.post('/',usersController.create);
router.put('/:id',usersController.update);
router.delete('/:id',usersController.destroy);


//Export
module.exports = router;