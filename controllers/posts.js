const handleSuccess = require('../service/handleSuccess');
const handleError = require('../service/handleError');
const handleLocalDate = require('../service/handleLocalDate');
const Posts = require('../model/posts');

const posts = {
  async createPosts(req, res) {
    try {
      const { body } = req;
      const createAt = handleLocalDate();
      if (body.content) {
        const newPost = await Posts.create({
          name: body.name,
          content: body.content,
          tags: body.tags,
          type: body.type,
          createAt: createAt,
          updateAt: createAt,
        });
        handleSuccess(res, newPost);
      } else {
        handleError(res);
      }
    } catch (err) {
      handleError(res, err);
    }
  },

  async getPosts(req, res) {
    const allPosts = await Posts.find();
    handleSuccess(res, allPosts);
    res.end();
  },

  // async findOne({ req, res }) {},

  async updateSinglePost({ req, res, body }) {
    const id = req.url.split('/').pop();
    const post = JSON.parse(body);
    try {
      if (post.hasOwnProperty('content') && post.content === '') {
        handleError(res);
      } else {
        const updateResult = await Posts.findByIdAndUpdate(id, {
          ...post,
          updateAt: this.localDate(),
        });
        if (updateResult) {
          handleSuccess(res, updateResult);
        } else {
          handleError(res, updateResult);
        }
      }
    } catch (err) {
      handleError(res, err);
    }
  },

  async deleteSinglePost({ req, res }) {
    const id = req.url.split('/').pop();
    try {
      const deleteResult = await Posts.findByIdAndDelete(id);
      // console.log(deleteResult);
      if (deleteResult) {
        handleSuccess(res, deleteResult);
      } else {
        handleError(res, deleteResult);
      }
    } catch (err) {
      handleError(res, err);
    }
  },

  async deletePosts({ req, res }) {
    const deleteResult = await Posts.deleteMany({});
    handleSuccess(res, deleteResult);
  },

  // async findAllPublished({ req, res }) {},
};

module.exports = posts;
