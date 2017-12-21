let express = require('express');
let router = express.Router();
let fileController = require('../controllers/fileitem');
let postController = require('../controllers/post');
let userController = require('../controllers/user');
let groupController = require('../controllers/group');
//-------------------------POST_API---------------------//

router.route('/').post(fileController.arrayFileUpload, userController.checkUserRequest, groupController.checkGroupRequest, groupController.checkMemberInGroup, fileController.postFilesIfHave, postController.addPost, postController.getPost);
router.route('/topic/:groupID').get(groupController.checkGroupRequest, postController.getPostsInTopic);

router.route('/like/:postID')
    .get(userController.checkUserRequestIfHave, postController.checkPostRequest, postController.getLikes)
    .post(userController.checkUserRequest, postController.checkPostRequest, postController.addLike, postController.getLikes)
    .delete(userController.checkUserRequest, postController.checkPostRequest, postController.removeLike, postController.getLikes);
router.route('/comment/:postID')
    .get(postController.checkPostRequest, postController.getComments)
    .post(fileController.fileUpload, userController.checkUserRequest, fileController.postFileIfHave, postController.checkPostRequest, postController.addComment)
    .put(fileController.fileUpload, userController.checkUserRequest, fileController.postFileIfHave, postController.checkPostRequest, postController.updateComment)
    .delete(userController.checkUserRequest, postController.checkPostRequest, postController.deleteComment);

router.route('/:postID')//TODO check user, group, member before run
    .get(postController.checkPostRequest, postController.getPost)
    .delete(userController.checkUserRequest, postController.deletePost, postController.getPost)
    .put(fileController.arrayFileUpload, userController.checkUserRequest, postController.checkPostRequest, fileController.postFilesIfHave, postController.updatePost, postController.getPost);
module.exports = router;