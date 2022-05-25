var express = require('express');
var router = express.Router();
const { handleErrorAsync, isAuth } = require('../middleware');
const uploadController = require('../controllers/upload');

router.post('.', isAuth, handleErrorAsync(uploadController.upload)); // 上傳檔案
