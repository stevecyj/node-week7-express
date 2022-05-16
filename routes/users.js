var express = require('express');
var router = express.Router();
const { handleErrorAsync, isAuth } = require('../middleware');
const usersController = require('../controllers/users');

router.get('/getAllUsers', usersController.getUsers);
router.post('/addUser', handleErrorAsync(usersController.createUser));
router.patch('/resetPassword/:id', usersController.resetUserPassword);

module.exports = router;
