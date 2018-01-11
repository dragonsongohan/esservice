let express = require('express');
let router = express.Router();

let userController = require('../controllers/user');
let fileController = require('../controllers/fileitem');
let groupController = require('../controllers/group');
let authController = require('../controllers/auth');

/*-------------------API-------------------------*/
router.use(authController.isAuthenticated);
router.route('/')
    .post(userController.checkSystemAccount, userController.postUser, userController.getUser)
    .get(userController.putCurrentUser, userController.getUser)
    .put(userController.putCurrentUser, userController.putUser, userController.getUser);
router.route('/manager/:userID')
    .get(userController.checkUserRequest, userController.getUser)
    .put(userController.checkSystemAccount, userController.checkUserRequest, userController.putUser, userController.getUser)
    .delete(userController.checkSystemAccount, userController.checkUserRequest, userController.deleteUser, userController.getUser);
router.route('/profileImage/:userID')
    .get(userController.checkUserRequest, userController.getProfileImageID, fileController.checkFileRequest, fileController.getFile);
router.route('/profileImage')
    .get(userController.putCurrentUser, userController.getProfileImageID, fileController.checkFileRequest, fileController.getFile)
    .put(userController.putCurrentUser, fileController.profileUpload, userController.getProfileImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, userController.putProfileImage, fileController.getInfoFile)
    .post(userController.putCurrentUser, fileController.profileUpload, userController.getProfileImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, userController.putProfileImage, fileController.getInfoFile);
router.route('/coverImage/:userID').get(userController.checkUserRequest, userController.getCoverImageID, fileController.checkFileRequest, fileController.getFile);
router.route('/coverImage')
    .get(userController.putCurrentUser, userController.getCoverImageID, fileController.checkFileRequest, fileController.getFile)
    .put(userController.putCurrentUser, fileController.coverUpload, userController.getCoverImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, userController.putCoverImage, fileController.getInfoFile)
    .post(userController.putCurrentUser, fileController.coverUpload, userController.getCoverImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, userController.putCoverImage, fileController.getInfoFile);
router.route('/info/:userID').get(userController.checkUserRequest, userController.getUserInfo);
router.route('/info').get(userController.putCurrentUser, userController.getUserInfo);
router.route('/files/:userID')
    .get(userController.checkSystemAccount, userController.checkUserRequest, userController.getFiles, fileController.getInfoFiles);
router.route('/files')
    .get(userController.putCurrentUser, userController.getFiles, fileController.getInfoFiles)
    .post(userController.putCurrentUser, fileController.arrayFileUpload, fileController.postFiles, fileController.getInfoFiles);
router.route('/classs/:userID').get(userController.checkSystemAccount, userController.checkUserRequest, userController.getClasss);
router.route('/classs')
    .get(userController.putCurrentUser, userController.getClasss)
    .delete(groupController.checkGroupRequest , groupController.checkMemberInGroup, userController.removeFromClass);
router.route('/friends/:userID')
    .get(userController.checkUserRequest, userController.getFriends)
    .delete(userController.checkUserRequest, userController.removeFriend);
router.route('/friends').get(userController.putCurrentUser, userController.getFriends);
router.route('/request/:userID')
    .post(userController.checkUserRequest, userController.addRequest)
    .delete(userController.checkUserRequest, userController.removeRequest);
router.route('/request').get(userController.putCurrentUser, userController.getRequests);
router.route('/requested/:userID')
    .post(userController.checkUserRequest,userController.confirmRequested)
    .delete(userController.checkUserRequest, userController.removeRequested);
router.route('/requested').get(userController.putCurrentUser, userController.getRequesteds);
router.route('/posts/:userID').get(userController.checkSystemAccount, userController.checkUserRequest, userController.getPosts);
router.route('/posts').get(userController.putCurrentUser, userController.getPosts);
router.route('/classrequest/:groupID')
    .post(groupController.checkGroupRequest ,userController.addClassRequest)
    .delete(groupController.checkGroupRequest, userController.removeClassRequest);
router.route('/classrequest').get(userController.getClassRequests);
router.route('/import').post(userController.checkSystemAccount, userController.postUsers, userController.getUsersInfo);
router.route('/importfile').post(userController.checkSystemAccount, fileController.fileUpload, fileController.postFile, fileController.putContentBody, userController.postUsers, userController.getUsersInfo);
router.route('/search').get(userController.searchUserByName);
router.route('/all').get(userController.checkSystemAccount, userController.getUsers);
//--------------------------------
module.exports = router;