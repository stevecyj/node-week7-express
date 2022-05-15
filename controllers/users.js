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
  async createUser(req, res) {
    try {
      const { body } = req;
      const createAt = handleLocalDate();
      if (body.email && body.userName && body.password) {
        const newUser = await User.create({
          email: body.email,
          userName: body.userName,
          password: body.password,
          avatar: body.avatar,
          gender: body.gender,
          follow: body.follow,
          beFollowed: body.beFollowed,
          likeList: body.likeList,
          createAt: createAt,
          updateAt: createAt,
        });
        successHandle(res, newUser);
      } else {
        errorHandle(res);
      }
    } catch (err) {
      errorHandle(res, err);
    }
  },
  async resetUserPassword(req, res) {
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
