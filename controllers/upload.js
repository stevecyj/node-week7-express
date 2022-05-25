const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../model/users');
const { successHandle, errorHandle, handleLocalDate, generateSendJWT } = require('../service');
const { appError } = require('../exceptions');

const upload = {
  async upload(req, res, next) {},
};

exports.upload = upload;
