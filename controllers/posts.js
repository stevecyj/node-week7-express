const handleSuccess = require('../service/handleSuccess');
const handleError = require('../service/handleError');
const Posts = require('../model/posts');

const posts = {
  localDate(v) {
    const d = new Date(v || Date.now());
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString();
  },
  async getPosts({ req, res }) {
    const allPosts = await Posts.find();
    handleSuccess(res, allPosts);
    res.end();
  },
  async createPosts({ req, res, body }) {
    try {
      const data = JSON.parse(body);
      const createAt = this.localDate();
      // console.log(createAt);
      if (data.content) {
        const newPost = await Posts.create({
          name: data.name,
          content: data.content,
          tags: data.tags,
          type: data.type,
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
  async deletePosts({ req, res }) {
    const deleteResult = await Posts.deleteMany({});
    handleSuccess(res, deleteResult);
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
};

module.exports = posts;
