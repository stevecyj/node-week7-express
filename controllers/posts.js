const handleSuccess = require('../service/handleSuccess');
const handleError = require('../service/handleError');
const handleLocalDate = require('../service/handleLocalDate');
const Posts = require('../model/posts');
const Users = require('../model/users');

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
    try {
      console.log(req.body);
      let { keyword, sortby, limit = 10, page = 1, userId, authorId } = req.body;
      let filter = keyword ? { content: new RegExp(`${keyword}`) } : {};
      let sort = sortby === 'desc' ? { createAt: -1 } : { createAt: 1 };
      if (page < 0) {
        page = 1;
      }
      let skip = limit * (page - 1);

      // 查詢貼文
      // 查詢特定使用者(貼文作者)
      if (authorId) {
        filter.user = authorId;
      }

      // 動態牆搜尋：1.呈現使用者追蹤對象和自己的發文 2.使用者無追縱對象時，由系統隨機抽樣10人給使用者(不足10人使用全清單)
      if (userId) {
        const users = await Users.find({ _id: userId });
        let follow = users[0] ? users[0].follow.map((item) => item.id) : [];

        if (!follow.length) {
          // 處理初始使用者未有follow時的動態牆搜尋
          // 之後可用資料庫語法來refact
          const userList = await Users.find({});
          if (userList.length < 10) {
            follow = userList
              .filter((item) => item._id.toString() !== userId)
              .map((item) => item._id.toString());
          } else {
            let counter = 0;
            follow = userList
              .filter((item) => {
                if (item._id.toString() === userId) {
                  return false;
                }
                if (counter <= 10 && Math.random() > 0.5) {
                  counter++;
                  return true;
                } else {
                  return false;
                }
              })
              .map((item) => item._id.toString());
          }
        }

        follow.push(userId);
        // console.log(follow);

        filter.user = { $in: follow };
      }

      const count = await Posts.find(filter).count();
      const posts = await Posts.find(filter).sort(sort).skip(skip).limit(limit).populate({
        path: 'user',
        select: 'userName avatar',
      });
      // console.log(posts);

      let resPosts = posts.map((item) => {
        return {
          user: item.user,
          postId: item._id,
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
        const updateResult = await Posts.findByIdAndUpdate(
          id,
          {
            ...body,
            updateAt: handleLocalDate(),
          },
          { runValidators: true, new: true }
        );
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
