var express = require('express');
var router = express.Router();
const { handleErrorAsync, isAuth } = require('../middleware');
const upload = require('../service/image');
const uploadController = require('../controllers/upload');

router.post('/', isAuth, upload, handleErrorAsync(uploadController.upload)); // 上傳檔案

module.exports = router;
