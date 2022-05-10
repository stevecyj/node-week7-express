const User = require('../model/users');
const handleSuccess = require('../service/handleSuccess');
const handleError = require('../service/handleError');
const handleLocalDate = require('../service/handleLocalDate');

const users = {
  async getUsers(req, res) {
    const allUsers = await User.find();
    handleSuccess(res, allUsers);
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
        handleSuccess(res, newUser);
      } else {
        handleError(res);
      }
    } catch (err) {
      handleError(res, err);
    }
  },
  async resetUserPassword(req, res) {
    try {
      const { id } = req.params;
      const { body } = req;
      const updateUser = await User.findById(id);
      if (updateUser && body.password) {
        const result = await User.findByIdAndUpdate(id, body);
        result ? handleSuccess(res, updateUser) : handleError(res);
      } else {
        handleError(res);
      }
    } catch (err) {
      handleError(res, err);
    }
  },
};

module.exports = users;
