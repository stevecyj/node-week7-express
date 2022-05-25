const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../model/users');
const { successHandle, errorHandle, handleLocalDate, generateSendJWT } = require('../service');
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

  // 註冊
  async signUp(req, res, next) {
    let { email, password, confirmPassword, userName } = req.body;
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

    // 加密密碼
    password = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      password,
      userName,
    });
    generateSendJWT(newUser, 201, res);
  },

  // 登入
  async signIn(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, '帳號密碼不可為空', next));
    }
    const user = await User.findOne({ email }).select('+password');
    // console.log(password, user.password);
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(400, '您的密碼不正確', next));
    }
    generateSendJWT(user, 200, res);
  },

  // user, update password，修改密碼
  async updatePassword(req, res, next) {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return next(appError('400', '欄位未填寫正確！', next));
    }
    if (password !== confirmPassword) {
      return next(appError('400', '密碼不一致！', next));
    }
    // 密碼 8 碼以上，16 碼以下，英大小寫+數+8碼+ exclued 特殊符號
    let reg = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,16}$/, 'g');
    if (password.match(reg) === null) {
      return next(appError('400', '請確認密碼格式符合格式', next));
    }

    // check new password is same as old password
    newPassword = await bcrypt.hash(password, 12);
    const currentUser = await User.findById(req.user.id).select('+password');
    const equal = await bcrypt.compare(password, currentUser.password);
    console.log(equal);
    if (equal) {
      return next(appError('400', '新密碼與舊密碼相同', next));
    }

    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });
    generateSendJWT(user, 200, res);
  },

  // user, get profile，取得個人資料
  async getProfile(req, res, next) {
    // const currentUser = await User.findById(req.user.id);
    // console.log(currentUser);

    res.status(200).send({
      status: 'success',
      user: req.user,
    });
  },

  // user, update profile，修改個人資料
  async updateProfile(req, res, next) {
    const { userName, gender, avatar } = req.body;
    let avatarExt = avatar.replace(/\/+$/, '').split('.').pop();
    let regURL = new RegExp(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'g');

    console.log(userName, gender, avatar, avatar.match(regURL));
    if (!userName || !gender) {
      return next(appError('400', '欄位未填寫正確', next));
    }

    if (!avatar.startsWith('https') || avatar.match(regURL) === null) {
      return next(appError('400', '請輸入正確圖片來源', next));
    }

    if (!(avatarExt == 'jpg' || avatarExt == 'png')) {
      return next(appError('400', '限 jpg 或 png', next));
    }

    const updateProfile = await User.findByIdAndUpdate(
      req.user.id,
      { ...req.body, updateAt: handleLocalDate() },
      { runValidators: true, new: true }
    );

    successHandle(res, updateProfile);
  },
};

module.exports = users;
