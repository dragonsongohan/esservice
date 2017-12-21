let express = require('express');
let router = express.Router();

let normalRouter = express.Router();
let teacherRouter = express.Router();
let guestRouter = express.Router();
let systemRouter = express.Router();

let userController = require('../controllers/user');
let fileController = require('../controllers/fileitem');
let groupController = require('../controllers/group');
let authController = require('../controllers/auth');

/*-------------------API-------------------------*/
router.route('/').post(userController.postUser, userController.getUser);
router.route('/profileImage/:userID')
    .get(userController.checkUserRequest, userController.getProfileImageID, fileController.checkFileRequest, fileController.getFile)
    .put(fileController.profileUpload, userController.checkUserRequest, userController.getProfileImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, userController.putProfileImage, fileController.getInfoFile)
    .post(fileController.profileUpload, userController.checkUserRequest, userController.getProfileImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, userController.putProfileImage, fileController.getInfoFile);
router.route('/coverImage/:userID')
    .get(userController.checkUserRequest, userController.getCoverImageID, fileController.checkFileRequest, fileController.getFile)
    .put(fileController.coverUpload, userController.checkUserRequest, userController.getCoverImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, userController.putCoverImage, fileController.getInfoFile)
    .post(fileController.coverUpload, userController.checkUserRequest, userController.getCoverImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, userController.putCoverImage, fileController.getInfoFile);

router.route('/friends/:userID').get(userController.checkUserRequest, userController.getFriends);
router.route('/friends/:userID/:friendUserID')
    .post(userController.checkUserRequest, userController.addFriend)
    .delete(userController.checkUserRequest, userController.removeFriend);
router.route('/classs/:userID').get(userController.checkUserRequest, userController.getClasss);
router.route('/request/:userID').get(userController.checkUserRequest, userController.getRequests);
router.route('/request/:userID/:friendUserID')
    .post(userController.checkUserRequest, userController.addRequest)
    .delete(userController.checkUserRequest, userController.removeRequest);
router.route('/requested').get(userController.checkUserRequest, userController.getRequesteds);
router.route('/requested/:userID').get(userController.checkUserRequest, userController.getRequesteds);
router.route('/requested/:userID/:friendUserID')
    .post(userController.checkUserRequest,userController.confirmRequested)
    .delete(userController.checkUserRequest, userController.removeRequested);

router.route('/posts/:userID').get(userController.checkUserRequest, userController.getPosts);
router.route('/classs/:userID/:groupID').delete(userController.checkUserRequest, groupController.checkGroupRequest , userController.removeFromClass);
router.route('/classrequest/:userID').get(userController.checkUserRequest, userController.getClassRequests);
router.route('/classrequest/:userID/:groupID')
    .post(userController.checkUserRequest, groupController.checkGroupRequest ,userController.addClassRequest)
    .delete(userController.checkUserRequest, groupController.checkGroupRequest, userController.removeClassRequest);

router.route('/login/').post(authController.isAuthenticated, userController.login);
router.route('/info/:userID').get(userController.checkUserRequest, userController.getUserInfo);
router.route('/files/:userID')
    .get(userController.checkUserRequest, userController.getFiles, fileController.getInfoFiles)
    .post(fileController.arrayFileUpload, userController.checkUserRequest, fileController.postFiles, fileController.getInfoFiles);
router.route('/search').get(userController.searchUserByName);
router.route('/all').get(userController.getUsers);
router.route('/:userID')
    .get(userController.checkUserRequest, userController.getUser)
    .put(userController.checkUserRequest, userController.putUser, userController.getUser)
    .delete(userController.deleteUser, userController.getUser);

//---------------------EXPORT----------------------------------//

// module.exports.Normal = normalRouter;
// module.exports.Guest = guestRouter;
// module.exports.System = systemRouter;
// module.exports.Teacher = teacherRouter;
// module.exports.Router = router;
module.exports = router;