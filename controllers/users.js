const validator = require('validator');
const User = require('../model/users');
// const successHandle = require('../service/successHandle');
// const errorHandle = require('../service/errorHandle');
// const handleLocalDate = require('../service/handleLocalDate');
const { successHandle, errorHandle, handleLocalDate } = require('../service');
const { appError } = require('../exceptions');

const users = {
  async getUsers(req, res) {
    const allUsers = await User.find();
    successHandle(res, allUsers);
  },
  async createUser(req, res, next) {
    let {
      email,
      userName,
      password,
      confirmPassword,
      avatar,
      gender,
      follow,
      beFollowed,
      likeList,
    } = req.body;
    // 內容不可為空
    if (!email || !password || !confirmPassword || !userName) {
      return next(appError('400', '欄位未填寫正確！', next));
    }
    // 密碼正確
    if (password !== confirmPassword) {
      return next(appError('400', '密碼不一致！', next));
    }
    // 密碼 8 碼以上，16 碼以下，英大小寫+數+8碼+ exclued 特殊符號
    let reg = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,16}$/, 'g');
    if (password.match(reg) === null) {
      return next(appError('400', '請確認密碼格式符合格式', next));
    }
    // 暱稱 2 個字以上
    if (!validator.isLength(userName, { min: 2 })) {
      return next(appError('400', '暱稱字數低於 2 碼', next));
    }
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(appError('400', 'Email 格式不正確', next));
    }

    const newUser = await User.create({
      email,
      userName,
      password,
      avatar,
      gender,
      follow,
      beFollowed,
      likeList,
      createAt: handleLocalDate(),
      updateAt: handleLocalDate(),
    });
    res.status(200).json({
      status: 'success',
      user: newUser,
    });
    // try {
    //   const { body } = req;
    //   const createAt = handleLocalDate();
    //   if (body.email && body.userName && body.password) {
    //     const newUser = await User.create({
    //       email: body.email,
    //       userName: body.userName,
    //       password: body.password,
    //       avatar: body.avatar,
    //       gender: body.gender,
    //       follow: body.follow,
    //       beFollowed: body.beFollowed,
    //       likeList: body.likeList,
    //       createAt: createAt,
    //       updateAt: createAt,
    //     });
    //     successHandle(res, newUser);
    //   } else {
    //     errorHandle(res);
    //   }
    // } catch (err) {
    //   errorHandle(res, err);
    // }
  },
  async resetUserPassword(req, res) {
    console.log(req.params);
    try {
      const { id } = req.params;
      const { body } = req;
      const updateUser = await User.findById(id);
      if (updateUser && body.password) {
        const result = await User.findByIdAndUpdate(
          id,
          { ...body, updateAt: handleLocalDate() },
          { runValidators: true, new: true }
        );
        result ? successHandle(res, updateUser) : errorHandle(res);
      } else {
        errorHandle(res);
      }
    } catch (err) {
      errorHandle(res, err);
    }
  },
};

module.exports = users;
