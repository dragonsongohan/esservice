let express = require('express');
let router = express.Router();
let groupController = require('../controllers/group');
let userController = require('../controllers/user');
let fileController = require('../controllers/fileitem');
let postController = require('../controllers/post');

/*-------------------GROUP_API-----------------------*/
router.route('/all').get(groupController.getGroups);
router.route('/create/:userID').post(userController.checkUserRequest, groupController.postGroup, groupController.getGroup);
router.route('/info/:groupID').get(groupController.checkGroupRequest, groupController.getGroup);
router.route('/profileImage/:groupID')
    .get(groupController.checkGroupRequest, groupController.getProfileImageID, fileController.checkFileRequest, fileController.getFile)
    .put(fileController.profileUpload, userController.checkUserRequestIfHave, groupController.checkGroupRequest, groupController.getProfileImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, groupController.putProfileImage, fileController.getInfoFile)
    .post(fileController.profileUpload, userController.checkUserRequestIfHave, groupController.checkGroupRequest, groupController.getProfileImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, groupController.putProfileImage, fileController.getInfoFile);
    // .post(fileController.profileUpload, userController.checkUserRequestIfHave, groupController.checkGroupRequest, fileController.postFile, groupController.putProfileImage, fileController.getInfoFile);
router.route('/members/:groupID')
    .get(groupController.checkGroupRequest, groupController.getMembers)
    .post(groupController.checkGroupRequest, groupController.addMember)
    .put(groupController.checkGroupRequest, groupController.updateMember)
    .delete(groupController.checkGroupRequest, groupController.removeMember);
router.route('/members/:groupID/:userID')
    .post(groupController.checkGroupRequest, groupController.addMember)
    .put(groupController.checkGroupRequest, groupController.updateMember)
    .delete(groupController.checkGroupRequest, groupController.removeMember);

router.route('/requested/:groupID').get(groupController.checkGroupRequest, groupController.getRequesteds);
router.route('/requested/:groupID/:userID')
    .post(groupController.checkGroupRequest, groupController.confirmRequested)
    .delete(groupController.checkGroupRequest, groupController.removeRequested);
router.route('/action/:groupID/:userID')
    .put(groupController.checkGroupRequest, groupController.putGroup, groupController.getGroup)
    .delete(groupController.checkGroupRequest, groupController.deleteGroup, groupController.getGroup);
router.route('/action/:groupID')
    .put(groupController.checkGroupRequest, groupController.putGroup, groupController.getGroup)
    .delete(groupController.checkGroupRequest, groupController.deleteGroup, groupController.getGroup);
router.route('/files/:groupID')
    .get(groupController.checkGroupRequest, groupController.getFiles, fileController.getInfoFiles)
    .post(fileController.arrayFileUpload, userController.checkUserRequestIfHave, groupController.checkGroupRequest, fileController.postFiles, fileController.getInfoFiles);
router.route('/search').get(groupController.searchGroupByName);
router.route('/post/:groupID').get(groupController.checkGroupRequest, groupController.getAllPosts);
router.route('/post/:groupID/:userID')
    .get(userController.checkUserRequest, groupController.checkGroupRequest, groupController.getPosts)
    .post(fileController.arrayFileUpload, userController.checkUserRequest, groupController.checkGroupRequest, groupController.checkMemberInGroup, fileController.postFilesIfHave, postController.addPost, postController.getPost);

// router.route('/topic/:groupID/:userID').get(userController.checkUserRequestIfHave, groupController.checkGroupRequest, postController.getPostsInTopic)
router.route('/topic/:groupID')
    .get(groupController.checkGroupRequest, groupController.getTopics)
    .post(userController.checkUserRequest, groupController.checkGroupRequest, groupController.addTopic)
    .put(userController.checkUserRequest, groupController.checkGroupRequest,  groupController.addTopic)
    .delete(userController.checkUserRequest, groupController.checkGroupRequest, groupController.removeTopic);
router.route('/addtopics/:groupID').post(groupController.checkGroupRequest, groupController.addTopics);

module.exports = router;