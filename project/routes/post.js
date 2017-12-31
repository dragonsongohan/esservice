let express = require('express');
let router = express.Router();
let fileController = require('../controllers/fileitem');
let postController = require('../controllers/post');
let userController = require('../controllers/user');
let groupController = require('../controllers/group');
let authController = require('../controllers/auth');
//-------------------------POST_API---------------------//
router.use(authController.isAuthenticated);

router.route('/like/:postID')
    .get(postController.checkPostRequest, postController.putGroupRequest, groupController.checkGroupRequest, postController.checkPermitForUser, postController.getLikes)
    .post(postController.checkPostRequest, postController.putGroupRequest, groupController.checkGroupRequest, postController.checkPermitForUser, postController.addLike, postController.getLikes)
    .delete(postController.checkPostRequest, postController.putGroupRequest, groupController.checkGroupRequest, postController.checkPermitForUser, postController.removeLike, postController.getLikes);
router.route('/comment/:postID')
    .get(postController.checkPostRequest, postController.putGroupRequest, groupController.checkGroupRequest, postController.checkPermitForUser, postController.getComments)
    .post(fileController.fileUpload, fileController.postFileIfHave, postController.checkPostRequest, postController.putGroupRequest, groupController.checkGroupRequest, postController.checkPermitForUser, postController.addComment)
    .put(fileController.fileUpload, fileController.postFileIfHave, postController.checkPostRequest, postController.putGroupRequest, groupController.checkGroupRequest, postController.checkPermitForUser, postController.updateComment)
    .delete(postController.checkPostRequest, postController.putGroupRequest, groupController.checkGroupRequest, groupController.checkAdminInGroupAccount, postController.deleteComment);

router.route('/info/:postID').get(postController.checkPostRequest, postController.putGroupRequest, groupController.checkGroupRequest, postController.checkPermitForUser, postController.getPost);
router.route('/delete/:postID').delete(postController.checkPostRequest, postController.putGroupRequest, groupController.checkGroupRequest, groupController.checkAdminInGroupAccount, postController.deletePost, postController.getPost);
router.route('/update/:postID').put(fileController.arrayFileUpload, postController.checkPostRequest, postController.putGroupRequest, groupController.checkGroupRequest, fileController.postFilesIfHave, postController.checkPermitForUser, postController.updatePost, postController.getPost);
module.exports = router;