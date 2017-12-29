let express = require('express');
let router = express.Router();
let groupController = require('../controllers/group');
let userController = require('../controllers/user');
let fileController = require('../controllers/fileitem');
let postController = require('../controllers/post');
let authController = require('../controllers/auth');
/*-------------------GROUP_API-----------------------*/
router.use(authController.isAuthenticated);
router.route('/all').get(groupController.getGroups);
router.route('/create').post(userController.checkSystemOrTeacherAccount, groupController.postGroup, groupController.getGroup);
router.route('/info/:groupID').get(groupController.checkGroupRequest, groupController.getGroup);
router.route('/search').get(groupController.searchGroupByName);
router.route('/update/:groupID').put(groupController.checkGroupRequest, groupController.checkSystemOrAdminInGroupAccount, groupController.putGroup, groupController.getGroup);
router.route('/delete/:groupID').delete(groupController.checkGroupRequest, groupController.checkSystemOrAdminInGroupAccount, groupController.deleteGroup, groupController.getGroup);
router.route('/profileImage/:groupID')
    .get(groupController.checkGroupRequest, groupController.getProfileImageID, fileController.checkFileRequest, fileController.getFile)
    .put(fileController.profileUpload, groupController.checkGroupRequest, groupController.checkSystemOrAdminInGroupAccount, groupController.getProfileImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, groupController.putProfileImage, fileController.getInfoFile)
    .post(fileController.profileUpload, groupController.checkGroupRequest, groupController.checkSystemOrAdminInGroupAccount, groupController.getProfileImageID, fileController.checkFileRequestIfHave, fileController.postOrUpdateFile, groupController.putProfileImage, fileController.getInfoFile);
router.route('/files/:groupID')
    .get(groupController.checkGroupRequest, groupController.checkMemberInGroup, groupController.getFiles, fileController.getInfoFiles)
    .post(fileController.arrayFileUpload, groupController.checkGroupRequest, groupController.checkMemberInGroup, fileController.postFiles, fileController.getInfoFiles);
router.route('/requested/:groupID/:userID')
    .post(groupController.checkGroupRequest, groupController.checkAdminInGroupAccount, userController.checkUserRequest, groupController.confirmRequested)
    .delete(groupController.checkGroupRequest, groupController.checkAdminInGroupAccount, userController.checkUserRequest, groupController.removeRequested);
router.route('/requested/:groupID').get(groupController.checkGroupRequest, groupController.checkAdminInGroupAccount, groupController.getRequesteds);
router.route('/topic/:groupID')
    .get(groupController.checkGroupRequest, groupController.getTopics)
    .post(groupController.checkGroupRequest, groupController.checkAdminInGroupAccount, groupController.addTopic)
    .delete(groupController.checkGroupRequest, groupController.checkAdminInGroupAccount, groupController.removeTopic);
router.route('/addtopics/:groupID').post(groupController.checkGroupRequest, groupController.checkAdminInGroupAccount, groupController.addTopics);

router.route('/members/:groupID/:userID').delete(groupController.checkGroupRequest, groupController.checkMemberInGroup, userController.putCurrentUser, groupController.removeMember);
router.route('/members/:groupID')
    .get(groupController.checkGroupRequest, groupController.getMembers)
    .post(userController.checkSystemAccount, groupController.checkGroupRequest, userController.putCurrentUser, groupController.addMember)
    .put(groupController.checkGroupRequest, groupController.checkSystemOrAdminInGroupAccount, userController.checkUserRequest, groupController.updateMember);

router.route('/post/:groupID/:userID').get(userController.checkSystemAccount, groupController.checkGroupRequest,userController.checkUserRequest, groupController.getPosts);
router.route('/post/:groupID')
    .get(groupController.checkGroupRequest, userController.putCurrentUser, groupController.getPosts)//getAllPosts;
    .post(fileController.arrayFileUpload, groupController.checkGroupRequest, userController.putCurrentUser, groupController.checkAdminInGroupAccount, fileController.postFilesIfHave, postController.addPost, postController.getPost);

module.exports = router;