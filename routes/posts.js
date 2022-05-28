var express = require('express');
var router = express.Router();
const { handleErrorAsync, isAuth } = require('../middleware');

const postsController = require('../controllers/posts');

// create and save a new post
router.post('/add', isAuth, handleErrorAsync(postsController.createPosts));

// retrieve all posts from db
router.get('/posts', isAuth, postsController.getPosts);

// find a single post by id
// router.get('/getOnePost/:id', postsController.findOne);

// search posts by keyword
router.post('/search', postsController.search);

// update a post by id
router.patch('/:id', isAuth, handleErrorAsync(postsController.updateSinglePost));

// delete a post by id
router.delete('/:id', isAuth, handleErrorAsync(postsController.deleteSinglePost));

// delete all posts
router.delete('/deleteAllPosts', postsController.deletePosts);

// find all published posts
// router.get('/getAllPublishedPosts', postsController.findAllPublished);

module.exports = router;
