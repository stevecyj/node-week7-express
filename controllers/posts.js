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
          user: body.user,
          userName: body.userName,
          userPhoto: body.userPhoto,
          tags: body.tags,
          type: body.type || 'person',
          image: body.image,
          content: body.content,
          likes: req.body.likes,
          comments: req.body.comments,
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

  // async findOne( req, res ) {},

  async search(req, res) {
    console.log(req.body);
    let { keyword, sortby, limit = 10, page = 1 } = req.body;
    let filter = keyword ? { content: new RegExp(`${keyword}`) } : {};
    let sort = sortby === 'datetime_pub' ? { createAt: -1 } : { createAt: 1 };
    if (page < 0) {
      page = 1;
    }
    let skip = limit * (page - 1);
    try {
      const count = await Posts.find(filter).count();
      const posts = await Posts.find(filter).sort(sort).skip(skip).limit(limit);
      let resPosts = posts.map((item) => {
        return {
          postId: item._id,
          userName: item.userName,
          userPhoto: item.userPhoto,
          content: item.content,
          image: item.image,
          datetime_pub: item.createAt,
        };
      });
      let payload = { count, limit, page, posts: resPosts };
      res.status(200).send({ status: 'success', payload });
    } catch (err) {
      handleError(res, err);
    }
  },

  async updateSinglePost(req, res) {
    const id = req.url.split('/').pop();
    const { body } = req;
    try {
      if (body.hasOwnProperty('content') && body.content === '') {
        handleError(res);
      } else {
        const updateResult = await Posts.findByIdAndUpdate(id, {
          ...body,
          updateAt: handleLocalDate(),
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

  async deleteSinglePost(req, res) {
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
