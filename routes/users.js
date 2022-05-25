var express = require('express');
var router = express.Router();
const { handleErrorAsync, isAuth } = require('../middleware');
const usersController = require('../controllers/users');

router.post('/sign_up', handleErrorAsync(usersController.signUp)); // 使用者註冊
router.post('/sign_in', handleErrorAsync(usersController.signIn)); // 使用者登入
router.post('/updatePassword', isAuth, handleErrorAsync(usersController.updatePassword)); // 修改密碼
router.get('/profile', isAuth, handleErrorAsync(usersController.getProfile)); // 取得個人資料
router.patch('/updateProfile', isAuth, handleErrorAsync(usersController.updateProfile)); // 更新個人資料

router.get('/getAllUsers', usersController.getUsers);
router.post('/addUser', handleErrorAsync(usersController.createUser));
router.patch('/resetPassword/:id', usersController.resetUserPassword);

module.exports = router;
