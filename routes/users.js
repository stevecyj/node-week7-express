var express = require('express');
var router = express.Router();
const { handleErrorAsync, isAuth } = require('../middleware');
const usersController = require('../controllers/users');

router.post('/sign_up', handleErrorAsync(usersController.signUp)); // 使用者註冊
// router.post('/sign_in', handleErrorAsync(usersController.signIn)); // 使用者登入
router.get('/getAllUsers', usersController.getUsers);
router.post('/addUser', handleErrorAsync(usersController.createUser));
router.patch('/resetPassword/:id', usersController.resetUserPassword);

module.exports = router;
