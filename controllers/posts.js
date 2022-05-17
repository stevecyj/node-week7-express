const { successHandle, errorHandle, handleLocalDate } = require('../service');
const { appError } = require('../exceptions');
const Posts = require('../model/posts');
const Users = require('../model/users');

const posts = {
  async createPosts(req, res, next) {
    const { user, userName, userPhoto, tags, type, image, content, likes, comments } = req.body;
    const postUser = await Users.findById(user).exec();
    if (content == undefined || content == '') {
      return next(appError(400, '你沒有填寫 content 資料', next));
    }

    if (!postUser) {
      return next(appError(400, '查無此使用者', next));
    }

    const createAt = handleLocalDate();
    const newPost = await Posts.create({
      user,
      userName,
      userPhoto,
      tags,
      type: type || 'person',
      image,
      content,
      likes,
      comments,
      createAt: createAt,
      updateAt: createAt,
    });
    successHandle(res, newPost);
  },

  async getPosts(req, res) {
    const allPosts = await Posts.find();
    successHandle(res, allPosts);
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
      errorHandle(res, err);
    }
  },

  async updateSinglePost(req, res, next) {
    const { postId } = req.params;
    const { user, content } = req.body;
    const postUser = await Users.findById(user).exec();
    // console.log(user, content);

    if (content == undefined || content == '') {
      return next(appError(400, '你沒有填寫 content 資料', next));
    }

    if (!postUser) {
      return next(appError(400, '查無此使用者', next));
    }

    const updateResult = await Posts.findByIdAndUpdate(
      postId,
      {
        ...req.body,
        updateAt: handleLocalDate(),
      },
      { runValidators: true, new: true }
    );
    successHandle(res, updateResult);
  },

  async deleteSinglePost(req, res, next) {
    const { id } = req.params;
    const { user } = req.body;
    const deleteUser = await Users.findById(user).exec();
    console.log(deleteUser);

    if (!deleteUser) {
      return next(appError(400, '查無此使用者', next));
    }

    const deleteResult = await Posts.findByIdAndDelete(id);
    successHandle(res, deleteResult);

    // try {
    //   const deleteResult = await Posts.findByIdAndDelete(id);
    //   // console.log(deleteResult);
    //   if (deleteResult) {
    //     successHandle(res, deleteResult);
    //   } else {
    //     errorHandle(res, deleteResult);
    //   }
    // } catch (err) {
    //   errorHandle(res, err);
    // }
  },

  async deletePosts({ req, res }) {
    const deleteResult = await Posts.deleteMany({});
    successHandle(res, deleteResult);
  },

  // async findAllPublished({ req, res }) {},
};

module.exports = posts;
