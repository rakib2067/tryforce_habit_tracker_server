//Requires
const express = require('express');
const router = express.Router();
const habitsController = require('../controllers/habits')

//Paths
router.get('/', habitsController.getAll);
router.post('/',habitsController.create);

router.get('/:id', habitsController.getById);
router.post('/:id', habitsController.create);
router.put('/:id',habitsController.update);
router.delete('/:id',habitsController.destroy);

//Export
module.exports = router;